// Secure Firebase Jobs API
// This handles all Firebase operations server-side to keep credentials secure

const admin = require("firebase-admin");
const firebaseConfig = require("../config/firebase-config");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: firebaseConfig.projectId,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseConfig.databaseURL,
  });
}

const db = admin.firestore();

// API endpoints for secure Firebase operations
module.exports = {
  // Get jobs with authentication
  async getJobs(req, res) {
    try {
      // Verify user authentication (implement your auth logic here)
      const userId = req.headers["user-id"]; // Or use JWT token verification

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const jobsSnapshot = await db
        .collection("jobs")
        .orderBy("addedAt", "desc")
        .limit(50)
        .get();

      const jobs = [];
      jobsSnapshot.forEach((doc) => {
        const jobData = doc.data();
        jobs.push({
          id: doc.id,
          ...jobData,
        });
      });

      res.json({ jobs });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  },

  // Add job with authentication
  async addJob(req, res) {
    try {
      const userId = req.headers["user-id"];

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const jobData = req.body;
      jobData.addedAt = admin.firestore.FieldValue.serverTimestamp();
      jobData.addedBy = userId;

      const docRef = await db.collection("jobs").add(jobData);

      res.json({
        id: docRef.id,
        message: "Job added successfully",
      });
    } catch (error) {
      console.error("Error adding job:", error);
      res.status(500).json({ error: "Failed to add job" });
    }
  },

  // Delete job with authentication
  async deleteJob(req, res) {
    try {
      const userId = req.headers["user-id"];
      const jobId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await db.collection("jobs").doc(jobId).delete();

      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  },
};
