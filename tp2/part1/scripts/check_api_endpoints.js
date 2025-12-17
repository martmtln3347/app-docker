import http from "http";
// Prevent app.js from auto-starting servers when imported by this script
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
import app from "../app.js";

async function run() {
	const server = http.createServer(app);

	await new Promise((resolve) => server.listen(0, resolve));
	const { port } = server.address();
	const base = `http://127.0.0.1:${port}/api`;

	try {
		console.log("Checking:", base + "/games");
		let res = await fetch(`${base}/games`);
		console.log("/games ->", res.status);
		console.log(await res.text());

		console.log("\nAttempt login (admin)");
		res = await fetch(`${base}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "admin@maets.com", password: "password" }),
		});
		console.log("/auth/login (admin) ->", res.status);
		const adminBody = await res.json().catch(() => ({}));
		console.log(adminBody);

		const token = adminBody.token;

		console.log("\nAttempt login (wrong password)");
		res = await fetch(`${base}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "alice@maets.com", password: "wrongpass" }),
		});
		console.log("/auth/login (wrong) ->", res.status);
		try {
			console.log(await res.json());
		} catch (e) {
			console.log(await res.text());
		}

		console.log("\nGET /me/library with admin token (should be 200/array or 403)");
		res = await fetch(`${base}/me/library`, {
			headers: { Authorization: token ? `Bearer ${token}` : "" },
		});
		console.log("/me/library ->", res.status);
		console.log(await res.text());

		console.log("\nGET /me/configs/1 with admin token");
		res = await fetch(`${base}/me/configs/1`, {
			headers: { Authorization: token ? `Bearer ${token}` : "" },
		});
		console.log("/me/configs/1 ->", res.status);
		console.log(await res.text());

		console.log('\nAll checks done');
	} catch (e) {
		console.error('Request failed:', e.message);
		} finally {
			await new Promise((resolve) => server.close(resolve));
		}
}

run();

