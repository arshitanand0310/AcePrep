import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResumeUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [error, setError] = useState("");

  
  const handleUpload = async () => {
    if (!file) return alert("Please choose a resume first");

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setError("");

    try {
      
      const { data } = await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (!data?.profile || !data?.resumeId) {
        throw new Error("Invalid response from server");
      }

      setProfile(data.profile);
      setResumeId(data.resumeId);

    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      setError(err?.response?.data?.message || "Resume upload failed");
    }

    setUploading(false);
  };

  
  const startInterview = async () => {
    if (!resumeId || generating) return;

    setGenerating(true);
    setError("");

    try {
      
      const { data } = await api.post(`/resumes/start-interview/${resumeId}`);

      if (!data?.interviewId) {
        throw new Error("Interview generation failed");
      }

      
      setTimeout(() => {
        navigate(`/interview/${data.interviewId}`);
      }, 400);

    } catch (err) {
      console.error("INTERVIEW START ERROR:", err.response?.data || err.message);
      setError(err?.response?.data?.message || "Failed to start interview");
      setGenerating(false);
    }
  };

  
  return (
    <div className="resume-container">

      <h1 className="resume-title">
        <span className="material-symbols-outlined">description</span>
        Resume Based Interview
      </h1>

      
      {!profile && (
        <div className="resume-upload-box">

          <span className="material-symbols-outlined upload-icon">upload_file</span>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (
            <p className="file-info">
              <span className="material-symbols-outlined">description</span>
              {file.name}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="resume-btn"
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined spinning">hourglass_empty</span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">cloud_upload</span>
                Upload Resume
              </>
            )}
          </button>

          {uploading && (
            <p className="resume-info">
              <span className="material-symbols-outlined">search</span>
              AI is reading your resume...
            </p>
          )}
          
          {error && <p className="resume-error">{error}</p>}

        </div>
      )}

     
      {profile && !generating && (
        <div className="resume-summary">

          <h2>
            <span className="material-symbols-outlined">summarize</span>
            Resume Summary
          </h2>

          <p>
            <span className="material-symbols-outlined">badge</span>
            <b>Role:</b> {profile.role || "Not detected"}
          </p>

          <p>
            <span className="material-symbols-outlined">work_history</span>
            <b>Experience:</b> {profile.experience_level || "Unknown"}
          </p>

          <p>
            <span className="material-symbols-outlined">psychology</span>
            <b>Skills:</b>{" "}
            {profile.skills?.length
              ? profile.skills.join(", ")
              : "No skills detected"}
          </p>

          <p>
            <span className="material-symbols-outlined">developer_mode</span>
            <b>Technologies:</b>{" "}
            {profile.technologies?.length
              ? profile.technologies.join(", ")
              : "No technologies detected"}
          </p>

          <p>
            <span className="material-symbols-outlined">assignment</span>
            <b>Projects:</b>{" "}
            {profile.projects?.length
              ? profile.projects.join(", ")
              : "No projects detected"}
          </p>

          <button
            onClick={startInterview}
            className="resume-btn start"
          >
            <span className="material-symbols-outlined">play_circle</span>
            Start AI Interview
          </button>

          {error && <p className="resume-error">{error}</p>}
        </div>
      )}

      
      {generating && (
        <div className="resume-generating">
          <span className="material-symbols-outlined generating-icon">auto_awesome</span>
          <h2>Preparing your personalized interview...</h2>
          <p>
            <span className="material-symbols-outlined">smart_toy</span>
            Generating questions based on your resume
          </p>
          <p>
            <span className="material-symbols-outlined">schedule</span>
            This usually takes 3-6 seconds
          </p>
        </div>
      )}

    </div>
  );
}