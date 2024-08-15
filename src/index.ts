import { Octokit } from "@octokit/rest";
import { v4 as uuidv4 } from 'uuid';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import 'dotenv/config';
import { TokenTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone  = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX!);


const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: 'dunzhang/stella_en_1.5B_v5',
});

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN // Replace with your GitHub personal access token
});


const owner = 'Jovial-Kanwadia';
const repo = 'Backend-Projects';
const branch = 'main'; // Specify the branch name here

async function getBranchSha(owner: string, repo: string, branch: string) {
    try {
        const { data } = await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch
        });
        return data.commit.sha; // Return the SHA of the branch's latest commit
    } catch (error) {
        console.error('Error fetching branch SHA:', error);
        throw error;
    }
}

async function readFile(owner: string, repo: string, path: string, branch: string) {
    try {
        const { data }: any = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch // Use branch name or SHA to specify the branch
        });

        if (data.content) {
            // Decode file content from Base64
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return content;
        } else {
            console.log(`No content found for ${path}`);
            return null;
        }
    } catch (error) {
        console.error(`Error reading file ${path}:`, error);
        return null;
    }
}

async function getTree(owner: string, repo: string, treeSha: string, recursive: boolean = false) {
    try {
        const { data } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: treeSha,
            recursive: recursive ? 'true' : 'false'
        });
        return data;
    } catch (error) {
        console.error('Error fetching tree:', error);
        throw error;
    }
}

function getFileType(filePath: string): string {
    const ext = filePath.split('.').pop();
    return ext || '';
}

function getFunctionNames(code: string): string[] {
    const functionNames: string[] = [];

    // Regular expressions to match different function types
    const functionRegex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/g; // Named function declarations
    const methodRegex = /(\b\w+)\s*:\s*function\s*\(/g; // Methods in objects (traditional syntax)
    const shorthandMethodRegex = /(\b\w+)\s*(?=\()/g; // Shorthand methods in objects and classes
    const arrowFunctionRegex = /([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*\([^)]*\)\s*=>/g; // Arrow functions
    const classMethodRegex = /class\s+[a-zA-Z_$][0-9a-zA-Z_$]*\s*{[^}]*?(\b\w+)\s*\([^)]*\)\s*{/g; // Methods in classes

    // Extract function names using regex
    let match: RegExpExecArray | null;

    while ((match = functionRegex.exec(code)) !== null) {
        functionNames.push(match[1]);
    }

    while ((match = methodRegex.exec(code)) !== null) {
        functionNames.push(match[1]);
    }

    while ((match = shorthandMethodRegex.exec(code)) !== null) {
        functionNames.push(match[1]);
    }

    while ((match = arrowFunctionRegex.exec(code)) !== null) {
        functionNames.push(match[1]);
    }

    while ((match = classMethodRegex.exec(code)) !== null) {
        functionNames.push(match[1]);
    }

    // Remove duplicates by converting to a Set and back to an array
    return Array.from(new Set(functionNames));
}

interface embeddedDataType{
  id: string,
  values: any,
  metadata: any,
}

let embeddedData: embeddedDataType[] = [];

async function processFiles() {
  try {
    const branchSha = await getBranchSha(owner, repo, branch);
    const tree = await getTree(owner, repo, branchSha, true);

    const chunkingStrategies = {
      'js': { chunkSize: 3000, chunkOverlap: 80 },
      'py': { chunkSize: 3000, chunkOverlap: 80 },
      // Add other strategies here
    };

    const supportedLanguages = [
      'html', 'cpp', 'go', 'java', 'js', 'php', 'proto', 'python', 'rst', 'ruby',
      'rust', 'scala', 'swift', 'markdown', 'latex', 'sol'
    ];

    for (const file of tree.tree) {
      if (file.path.startsWith('node_modules/')) continue;
      if (file.path.endsWith('package-lock.json') || file.path.endsWith('yarn.lock')) continue;

      if (file.type === 'blob') {
        const content = await readFile(owner, repo, file.path, branch);
        if (content) {
          let fileType: any = getFileType(file.path);
          if (fileType === 'ts') {
            fileType = 'js';
          }
          const strategy = chunkingStrategies[fileType] || { chunkSize: 3000, chunkOverlap: 80 };

          if (supportedLanguages.includes(fileType)) {
            try {
              const splitter = RecursiveCharacterTextSplitter.fromLanguage(fileType, strategy);
              const chunks = await splitter.createDocuments([content]);

              // Map chunks to metadataChunks
              const metadataChunks = chunks.map(chunk => ({
                pageContent: chunk.pageContent,
                metadata: {
                  fileName: file.path.split('/').pop(),
                  filePath: file.path,
                  fileExtension: fileType,
                  functionNames: getFunctionNames(content),
                  content: chunk.pageContent,
                }
              }));

              // Extract pageContent and get embeddings
              const pageContents = metadataChunks.map(chunk => chunk.pageContent);
              const vectors = await getEmbeddings(pageContents);
              embeddedData.push({
                id: uuidv4(), 
                values: vectors,
                metadata: metadataChunks[0].metadata,
              })
              // console.log({
              //   id: uuidv4(), 
              //   embeddings: vectors.length,
              //   metadata: metadataChunks[0].metadata,
              // });
              

            } catch (error) {
              console.error(`Error processing chunks for ${file.path}:`, error);
            }
          } else {
            const textSplitter = new TokenTextSplitter({
              chunkSize: 2000,
              chunkOverlap: 80,
            });
            const chunks = await textSplitter.createDocuments([content]);

            // Map chunks to metadataChunks
            const metadataChunks = chunks.map(chunk => ({
              pageContent: chunk.pageContent,
              metadata: {
                fileName: file.path.split('/').pop(),
                filePath: file.path,
                fileExtension: 'txt',
                functionNames: getFunctionNames(content),
                content: chunk.pageContent,
              }
            }));

            // Extract pageContent and get embeddings
            const pageContents = metadataChunks.map(chunk => chunk.pageContent);
            const vectors = await getEmbeddings(pageContents);
            embeddedData.push({
              id: uuidv4(), 
              values: vectors,
              metadata: metadataChunks[0].metadata,
            })
            // console.log({
            //   id: uuidv4(), 
            //   embeddings: vectors.length,
            //   metadata: metadataChunks[0].metadata,
            // });
          }
        }
      }
    }

    return embeddedData;
  } catch (error) {
    console.error('Error:', error);
  }
}


// Function to get embeddings
async function getEmbeddings(texts: string[]) {
  try {
    console.log("Embedding Started");
    const embedding = await embeddings._embed(texts);
    console.log('Embedding:', embedding[0].length);
    return embedding[0];
  } catch (error) {
    console.error('Error fetching embeddings:', error);
  }
}


const pushDataToPinecone = async() => {
  const pineconeInput: any = await processFiles();
  try {
    await pineconeIndex.namespace("repo1").upsert(pineconeInput);
    const stats = await pineconeIndex.describeIndexStats();
    console.log(stats);
  } catch (error) {
    console.log(error);
  }
}

// pushDataToPinecone();


const query = `register user logic`;
const runQuery = async() => {
  try {
    const queryEmbeddings = await getEmbeddings([query])
    const queryResponse = await pineconeIndex.namespace("repo1").query({
      topK: 3,
      vector: queryEmbeddings,
      includeValues: true,
      includeMetadata: true 
    });
    queryResponse.matches.map((data) => {
      console.log(data.score);
      console.log(data.metadata);
    })
  } catch (error) {
    console.log(error);
  }
}
runQuery();

