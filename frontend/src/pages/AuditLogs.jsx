import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "../css/auditTable.css";
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  const { loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    axiosInstance
      .get("/audit")
      .then((res) => {
        console.log("AUDIT RESPONSE");
        setLogs(res.data);
      })
      .catch((err) => console.error("AUDIT LOAD FAIL", err?.message));
  }, [loading]);

  return (
    <>
    {/* BACKGROUND */}
    <div className="fixed inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
    <div className="p-4 sm:p-6 text-white">
      
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Security Activity</h2>
       {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:flex w-full overflow-x-auto justify-center table-container">
          <table className="table-auto min-w-full max-w-4xl overflow-hidden rounded-md mb-10 text-xs sm:text-sm border border-white/10 bg-violet-950/20 audit-table">
            <thead>
              <tr className="bg-white text-black">
                <th className="p-2 sm:p-4">Action</th>
                <th className="p-2 sm:p-4">IP</th>
                <th className="p-2 sm:p-4">Device</th>
                <th className="p-2 sm:p-4">Time</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-red-600/60">
                    No activity yet
                  </td>
                </tr>
              )}

              {logs.map((l) => (
                <tr key={l._id} className="border-t border-white/10">
                  <td className="p-2 sm:p-4">{l.action}</td>
                  <td className="p-2 sm:p-4">{l.ip}</td>
                  <td className="p-2 sm:p-4 max-w-xs break-words">
                    {l.userAgent}
                  </td>
                  <td className="p-2 sm:p-4">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="md:hidden flex flex-col gap-4">
          {logs.length === 0 && (
            <div className="text-center text-red-600/60">
              No activity yet
            </div>
          )}

          {logs.map((l) => (
            <div
              key={l._id}
              className="bg-white/10 rounded-lg p-4 shadow-md flex flex-col gap-2"
            >
              <div>
                <span className="text-xs text-gray-400">Action</span>
                <div className="font-semibold">{l.action}</div>
              </div>

              <div>
                <span className="text-xs text-gray-400">IP</span>
                <div className="break-all">{l.ip}</div>
              </div>

              <div>
                <span className="text-xs text-gray-400">Device</span>
                <div className="text-sm break-words">
                  {l.userAgent}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400">Time</span>
                <div className="text-sm">
                  {new Date(l.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
    </>
  );
};

export default AuditLogs;
