/** Mensagens em português a partir de respostas do Neon Auth / Better Auth. */

type AuthFetchError = {
  message?: string;
  status?: number;
};

export function getAuthClientErrorMessage(err: AuthFetchError): string {
  const raw = (err.message ?? "").trim();
  const lower = raw.toLowerCase();

  if (lower.includes("invalid email or password") || lower.includes("invalid_email_or_password")) {
    return "E-mail ou senha inválidos.";
  }
  if (lower.includes("invalid password") || lower.includes("invalid_password")) {
    return "Senha inválida.";
  }
  if (
    lower.includes("user already exists") ||
    lower.includes("user_already_exists")
  ) {
    return "Já existe uma conta com este e-mail.";
  }
  if (lower.includes("password too short") || lower.includes("password_too_short")) {
    return "A senha é muito curta.";
  }
  if (lower.includes("password too long") || lower.includes("password_too_long")) {
    return "A senha é muito longa.";
  }
  if (lower.includes("invalid email") || lower.includes("invalid_email")) {
    return "E-mail inválido.";
  }
  if (lower.includes("banned_user") || lower.includes("you have been banned")) {
    return "Esta conta foi suspensa.";
  }
  if (raw) return raw;
  return "Não foi possível concluir a operação. Tente novamente.";
}
