import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../App.css";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

 
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError("");
    setSuccess("");

    if (!selected) return;

    
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(selected.type)) {
      setError("Only PDF or DOC/DOCX resumes are allowed");
      return;
    }

    
    if (selected.size > 2 * 1024 * 1024) {
      setError("File too large. Max size is 2MB");
      return;
    }

    setFile(selected);
  };

  
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });

      console.log("UPLOAD RESPONSE:", res.data);

      if (res.status === 201) {
        setSuccess("Resume uploaded successfully!");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setError(res.data?.message || "Resume upload failed");
      }

    } catch (err) {
      console.error("Upload error:", err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="dashboard upload-page">
      <h2>Upload Resume</h2>

      <div className="upload-box">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />

        {file && (
          <p className="file-name">
            Selected: <b>{file.name}</b>
          </p>
        )}

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

        <p className="hint">
          Upload a resume exported from Word/Google Docs.<br />
          Scanned or photo resumes will not work.
        </p>
      </div>
    </div>
  );
};

export default UploadResume;
