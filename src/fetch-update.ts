import fs from "fs";
import path from "path";

async function main() {
  const target = process.env.TARGET_REPO || "offcsystem-dotcom/updater";
  const [owner, repo] = target.split("/");
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
  const headers: any = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `token ${token}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`Failed to fetch latest release: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const data = await res.json();

  console.log(`Latest: ${data.tag_name} (${data.name})`);
  console.log(`Published at: ${data.published_at}`);
  console.log(`Changelog / release notes:\n${data.body || "(none)"}\n`);

  if (Array.isArray(data.assets) && data.assets.length) {
    console.log("Assets:");
    for (const a of data.assets) {
      console.log(`- ${a.name} -> ${a.browser_download_url}`);
    }
  } else {
    console.log("No assets found on release.");
  }

  // Try to fetch manifest.json asset if present
  const manifestAsset = (data.assets || []).find((a: any) => a.name === "manifest.json");
  if (manifestAsset) {
    const mres = await fetch(manifestAsset.browser_download_url, { headers });
    if (mres.ok) {
      const manifest = await mres.json();
      console.log("Manifest: ", JSON.stringify(manifest, null, 2));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
