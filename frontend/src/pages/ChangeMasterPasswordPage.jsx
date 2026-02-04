import { useLocation, useNavigate } from "react-router-dom";
import ChangeMasterPassword from "../components/ChangeMasterPassword";

const ChangeMasterPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const passwordList = location.state?.passwords;

  if (!passwordList) {
    return (
      <div>
        <p>Vault not loaded. Please unlock vault first.</p>
        <button onClick={() => navigate("/passwords")}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Rotate Master Password</h2>
      <ChangeMasterPassword passwordList={passwordList} />
    </div>
  );
};

export default ChangeMasterPasswordPage;
