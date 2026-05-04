import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  className = "",
}) {
  const [visible, setVisible] = useState(false);
  const eyeId = useId();

  return (
    <div className={`password-field-wrap ${className}`.trim()}>
      <input
        id={id || eyeId}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="password-field-input"
      />
     <button
  type="button"
  className="password-toggle"
  aria-label={visible ? "Hide password" : "Show password"}
  onClick={() => setVisible((v) => !v)}
>
  {visible ? <EyeOff size={20} /> : <Eye size={20} />}
</button>
    </div>
  );
}
