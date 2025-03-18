import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { IFetchRepoResponse, IUser } from "../../interfaces/auth.interfaces";

export const FetchUserRepo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { handler } = req.params; // Extract the handler parameter
    if (!handler) {
      res.status(400).json({
        status: "fail",
        message: "Handler parameter is required",
      });
      return;
    }

    const repoUrl = `https://api.github.com/users/${handler}/repos`;
    const response = await axios.get<IFetchRepoResponse[]>(repoUrl); // Explicitly type the response data
    const repos = response.data;

    if (!repos || repos.length === 0) {
      res.status(404).json({
        status: "fail",
        message: "No repositories found for this user",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: repos,
    });
  } catch (error: any) {
    next(error);
  }
};

export const ShowRepoTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params;
    if (!owner || !repo) {
      res.status(400).json({
        status: "fail",
        message: "Owner and Repo parameter are required",
      });
      return;
    }

    const user = req.user as IUser; // Get the user information from the req object
    console.log("User returning in showRepoTree", user);
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
      return;
    }

    const githubAccessToken = user.githubAccessToken; // Use the correct property name
    console.log(githubAccessToken);
    const repoTree = await getRepoTree(owner, repo, githubAccessToken);

    res.status(200).json({
      status: "success",
      data: repoTree,
    });
  } catch (error: any) {
    next(error);
  }
};

async function getRepoTree(owner: string, repo: string, accessToken: string) {
  // First get the default branch reference
  const repoResponse: any = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `token ${accessToken}` }
  });

  const defaultBranch: any = repoResponse.data.default_branch;

  // Get the reference for the default branch
  const refResponse: any = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
    headers: { Authorization: `token ${accessToken}` }
  });

  const commitSha: any = refResponse.data.object.sha;

  // Get the tree with recursive=1 to get all files
  const treeResponse: any = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`, {
    headers: { Authorization: `token ${accessToken}` }
  });

  // Filter to only include files
  return treeResponse.data.tree.filter((item: any) => item.type === 'blob');
}