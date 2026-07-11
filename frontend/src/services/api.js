const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function analyzePlant(payload) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Plant analysis failed.");
  }

  return response.json();
}

export async function getAnalyses(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/api/analyses`, { headers });
  if (!response.ok) {
    throw new Error("Could not load analysis history.");
  }
  return response.json();
}

