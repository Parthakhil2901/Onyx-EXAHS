// Secure Firebase Service
// This service communicates with secure server-side API endpoints
// Firebase credentials are never exposed to the client

class SecureFirebaseService {
  constructor() {
    this.baseUrl = "/api"; // Adjust based on your server setup
    this.userId = null;
  }

  // Set user ID for authentication
  setUserId(userId) {
    this.userId = userId;
  }

  // Get authentication headers
  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      "user-id": this.userId,
    };
  }

  // Secure method to get jobs
  async getJobs() {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  }

  // Secure method to add job
  async addJob(jobData) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding job:", error);
      throw error;
    }
  }

  // Secure method to delete job
  async deleteJob(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }

  // Secure method to update job
  async updateJob(jobId, jobData) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  }

  // Secure method to get job by ID
  async getJobById(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.job;
    } catch (error) {
      console.error("Error fetching job:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const secureFirebaseService = new SecureFirebaseService();
window.secureFirebaseService = secureFirebaseService;

export default secureFirebaseService;
