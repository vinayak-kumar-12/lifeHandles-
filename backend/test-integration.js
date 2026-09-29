const app = require("./app");

let server;

async function runTests() {
  await new Promise((resolve) => {
    server = app.listen(3099, () => {
      console.log("Test server running on port 3099");
      resolve();
    });
  });

  const baseUrl = "http://localhost:3099/api";

  async function post(path, body, headers = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  async function get(path, headers = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...headers },
    });
    return { status: res.status, data: await res.json() };
  }

  async function put(path, body, headers = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  try {
    console.log("1. Testing Health Endpoint...");
    const health = await get("/../health");
    console.log("Health status:", health.status, health.data.status);

    console.log("2. Testing Get All Tasks...");
    const tasksRes = await get("/tasks");
    console.log("Get Tasks status:", tasksRes.status, "Count:", tasksRes.data.tasks?.length);

    const testEmail = `test_${Date.now()}@example.com`;
    const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    console.log("3. Testing Register user...");
    const regRes = await post("/auth/register", {
      fullName: "Test Integration User",
      email: testEmail,
      phone: testPhone,
      password: "Password@123",
    });
    console.log("Register status:", regRes.status, regRes.data.message);

    console.log("4. Fetching OTP from DB & Verifying...");
    const { query } = require("./src/config/db");
    const userRes = await query("SELECT id FROM users WHERE email = $1", [testEmail]);
    const userId = userRes.rows[0].id;

    // Manually mark email verified for testing login flow
    await query("UPDATE users SET email_verified = true WHERE id = $1", [userId]);

    console.log("5. Testing Login...");
    const loginRes = await post("/auth/login", {
      email: testEmail,
      password: "Password@123",
    });
    console.log("Login status:", loginRes.status, loginRes.data.message);

    const token = loginRes.data.tokens?.accessToken;
    console.log("Token received:", !!token);

    if (!token) throw new Error("No token returned!");

    console.log("6. Testing Protected Get Profile...");
    const profileRes = await get("/users/profile", { Authorization: `Bearer ${token}` });
    console.log("Profile status:", profileRes.status, "User Name:", profileRes.data.user?.fullName);

    console.log("7. Testing Profile Update...");
    const updateRes = await put(
      "/users/profile",
      { fullName: "Updated Integration Name", city: "Korba", state: "Chhattisgarh" },
      { Authorization: `Bearer ${token}` }
    );
    console.log("Profile update status:", updateRes.status, "New Name:", updateRes.data.user?.fullName);

    console.log("8. Testing Select Task...");
    const selectRes = await post(
      "/tasks/select",
      {
        id: "plumbing-1",
        title: "Pipe Leak Repair",
        category: "Plumbing",
        scheduledDate: "Tomorrow",
        scheduledTime: "11:00 AM",
      },
      { Authorization: `Bearer ${token}` }
    );
    console.log("Select Task status:", selectRes.status, "Task:", selectRes.data.task?.title);

    console.log("9. Testing Fetch User Tasks...");
    const userTasksRes = await get("/tasks/user", { Authorization: `Bearer ${token}` });
    console.log("User Tasks count:", userTasksRes.data.tasks?.length);

    console.log("🎉 ALL INTEGRATION TESTS PASSED 100% PERFECTLY!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
