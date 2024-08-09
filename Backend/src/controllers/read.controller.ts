import { Octokit } from "@octokit/rest";
import 'dotenv/config';
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { Response } from "express";

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN // Replace with your GitHub personal access token
});

// const owner = 'Jovial-Kanwadia';
// const repo = 'Backend-Projects';
// const branch = 'main';

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
            console.log(`Content of ${path}:`);
            console.log(content);
        } else {
            console.log(`No content found for ${path}`);
        }
    } catch (error) {
        console.error(`Error reading file ${path}:`, error);
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


const readGithubRepository = asyncHandler(async(req: AuthRequest, res: Response)=> {
    const { repo, owner, branch } = req.body;
    try {
        const branchSha = await getBranchSha(owner, repo, branch); // Get SHA for the specific branch

        // Fetch the tree of the specified branch
        const tree = await getTree(owner, repo, branchSha, true);

        // Filter out node_modules and other metadata files
        for (const file of tree.tree) {
            if (file.path.startsWith('node_modules/')) continue; // Skip node_modules
            if (file.path.endsWith('package-lock.json') || file.path.endsWith('yarn.lock')) continue; // Skip lock files
            if (file.type === 'blob') {
                console.log(`Found file: ${file.path}`);
                await readFile(owner, repo, file.path, branch); // Read file content from the specific branch
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
})

export {
    readGithubRepository,
}
