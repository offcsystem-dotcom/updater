import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Octokit } from "@octokit/rest";

function sha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.error("Missing GITHUB_TOKEN or GH_TOKEN environment variable.");
    process.exit(1);
  }

  const target = process.env.TARGET_REPO || "offcsystem-dotcom/updater";
  const [owner, repo] = target.split("/");
  const version = process.env.VERSION || process.env.TAG || "v0.0.0";
  const asset32 = process.env.ASSET_32;
  const asset64 = process.env.ASSET_64;
  const changelogText = process.env.CHANGELOG || "";

  if (!asset32 || !asset64) {
    console.error("Provide ASSET_32 and ASSET_64 paths in environment.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  // create release
  console.log(`Creating release ${version} in ${owner}/${repo}`);
  const release = await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: version,
    name: version,
    body: changelogText,
    draft: false,
    prerelease: false,
  });

  const uploads: Array<{ path: string; name: string; sha: string }> = [];

  for (const p of [asset32, asset64]) {
    const buff = fs.readFileSync(p);
    const name = path.basename(p);
    const sha = sha256(buff);
    console.log(`Uploading ${name} (sha256=${sha})`);
    await octokit.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: release.data.id,
      name,
      data: buff as any,
      headers: {
        "content-type": "application/octet-stream",
        "content-length": buff.length,
      },
    });
    uploads.push({ path: p, name, sha });
  }

  // manifest
  const manifest = {
    version,
    published_at: new Date().toISOString(),
    artifacts: uploads.map((u) => ({ name: u.name, sha256: u.sha })),
    changelog: changelogText,
  } as const;

  const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2));
  await octokit.repos.uploadReleaseAsset({
    owner,
    repo,
    release_id: release.data.id,
    name: "manifest.json",
    data: manifestBuf as any,
    headers: {
      "content-type": "application/json",
      "content-length": manifestBuf.length,
    },
  });

  console.log("Release published. Manifest:", JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
