import { getPasswordStrength } from "../utils/passwordStrength";

const colors = ["#ff4d4d", "#ff884d", "#ffd24d", "#a3e635", "#22c55e"];
const labels = ["Very Weak", "Weak", "Okay", "Strong", "Very Strong"];

const PasswordStrengthMeter = ({ password }) => {
  const strength = getPasswordStrength(password);

  if (!strength) return null;

  return (
    <div className="mt-2">
      {/* bar */}
      <div className="h-2 w-full bg-gray-700 rounded">
        <div
          className="h-2 rounded transition-all"
          style={{
            width: `${(strength.score + 1) * 20}%`,
            backgroundColor: colors[strength.score],
          }}
        />
      </div>

      {/* label */}
      <p
        className="text-sm mt-1"
        style={{ color: colors[strength.score] }}
      >
        {labels[strength.score]} • crack time: {strength.crackTime}
      </p>

      {/* feedback */}
      {strength.feedback && (
        <p className="text-xs text-yellow-400 mt-1">
          {strength.feedback}
        </p>
      )}

      {strength.suggestions?.length > 0 && (
        <ul className="text-xs text-gray-300 list-disc ml-4 mt-1">
          {strength.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
