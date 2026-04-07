import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Label Studio Elite",
  description: "Criação de etiquetas de alimentos de forma profissional",
};

const ptBR = {
  // Menu do perfil (UserButton)
  ACCOUNT: "Conta",
  SETTINGS: "Configurações",
  SECURITY: "Segurança",
  SIGN_OUT: "Sair",
  PERSONAL_ACCOUNT: "Conta Pessoal",
  SWITCH_ACCOUNT: "Trocar Conta",
  ADD_ACCOUNT: "Adicionar Conta",
  ACCOUNTS: "Contas",
  // Página de configurações
  NAME: "Nome",
  NAME_DESCRIPTION: "Insira seu nome completo ou um nome de exibição.",
  NAME_INSTRUCTIONS: "Use no máximo 32 caracteres.",
  NAME_PLACEHOLDER: "Nome",
  EMAIL: "E-mail",
  EMAIL_DESCRIPTION: "Insira o endereço de e-mail que deseja usar para login.",
  EMAIL_INSTRUCTIONS: "Insira um endereço de e-mail válido.",
  EMAIL_PLACEHOLDER: "m@exemplo.com",
  AVATAR: "Avatar",
  AVATAR_DESCRIPTION: "Clique no avatar para enviar uma imagem personalizada.",
  AVATAR_INSTRUCTIONS: "Um avatar é opcional, mas recomendado.",
  UPLOAD_AVATAR: "Enviar Avatar",
  DELETE_AVATAR: "Remover Avatar",
  SAVE: "Salvar",
  UPDATE: "Atualizar",
  DELETE: "Excluir",
  CANCEL: "Cancelar",
  DONE: "Concluído",
  UPDATED_SUCCESSFULLY: "Atualizado com sucesso",
  DELETE_ACCOUNT: "Excluir Conta",
  DELETE_ACCOUNT_DESCRIPTION:
    "Remova permanentemente sua conta e todo o seu conteúdo. Esta ação é irreversível.",
  DELETE_ACCOUNT_INSTRUCTIONS:
    "Confirme a exclusão da sua conta. Esta ação é irreversível.",
  DELETE_ACCOUNT_VERIFY:
    "Verifique seu e-mail para confirmar a exclusão da conta.",
  DELETE_ACCOUNT_SUCCESS: "Sua conta foi excluída.",
  // Página de segurança
  CHANGE_PASSWORD: "Alterar Senha",
  CHANGE_PASSWORD_DESCRIPTION: "Insira sua senha atual e uma nova senha.",
  CHANGE_PASSWORD_INSTRUCTIONS: "Use no mínimo 8 caracteres.",
  CHANGE_PASSWORD_SUCCESS: "Sua senha foi alterada.",
  CURRENT_PASSWORD: "Senha Atual",
  CURRENT_PASSWORD_PLACEHOLDER: "Senha Atual",
  NEW_PASSWORD: "Nova Senha",
  NEW_PASSWORD_PLACEHOLDER: "Nova Senha",
  CONFIRM_PASSWORD: "Confirmar Senha",
  CONFIRM_PASSWORD_PLACEHOLDER: "Confirmar Senha",
  PASSWORDS_DO_NOT_MATCH: "As senhas não coincidem",
  PASSWORD_REQUIRED: "Senha é obrigatória",
  PASSWORD: "Senha",
  PASSWORD_PLACEHOLDER: "Senha",
  SET_PASSWORD: "Definir Senha",
  SET_PASSWORD_DESCRIPTION:
    "Clique no botão abaixo para receber um e-mail para configurar uma senha.",
  TWO_FACTOR: "Dois Fatores",
  TWO_FACTOR_CARD_DESCRIPTION:
    "Adicione uma camada extra de segurança à sua conta.",
  ENABLE_TWO_FACTOR: "Ativar Dois Fatores",
  DISABLE_TWO_FACTOR: "Desativar Dois Fatores",
  TWO_FACTOR_ENABLED: "Autenticação de dois fatores ativada",
  TWO_FACTOR_DISABLED: "Autenticação de dois fatores desativada",
  TWO_FACTOR_ENABLE_INSTRUCTIONS: "Insira sua senha para ativar o 2FA",
  TWO_FACTOR_DISABLE_INSTRUCTIONS: "Insira sua senha para desativar o 2FA.",
  TWO_FACTOR_DESCRIPTION: "Insira sua senha de uso único para continuar",
  TWO_FACTOR_ACTION: "Verificar código",
  TWO_FACTOR_PROMPT: "Autenticação de Dois Fatores",
  TWO_FACTOR_TOTP_LABEL: "Escaneie o QR Code com seu Autenticador",
  SESSIONS: "Sessões",
  SESSIONS_DESCRIPTION: "Gerencie suas sessões ativas e revogue acessos.",
  CURRENT_SESSION: "Sessão Atual",
  REVOKE: "Revogar",
  PROVIDERS: "Provedores",
  PROVIDERS_DESCRIPTION: "Conecte sua conta a um serviço de terceiros.",
  PASSKEYS: "Chaves de Acesso",
  PASSKEYS_DESCRIPTION: "Gerencie suas chaves de acesso.",
  PASSKEYS_INSTRUCTIONS: "Acesse sua conta com segurança sem senha.",
  PASSKEY: "Chave de Acesso",
  ADD_PASSKEY: "Adicionar Chave de Acesso",
  BACKUP_CODES: "Códigos de Backup",
  BACKUP_CODES_DESCRIPTION:
    "Salve esses códigos em um lugar seguro para acessar sua conta se perder o autenticador.",
  BACKUP_CODE: "Código de Backup",
  BACKUP_CODE_PLACEHOLDER: "Código de Backup",
  COPY_ALL_CODES: "Copiar todos os códigos",
  COPY_TO_CLIPBOARD: "Copiar para área de transferência",
  COPIED_TO_CLIPBOARD: "Copiado para área de transferência",
  // Erros comuns
  SESSION_EXPIRED: "Sua sessão expirou. Faça login novamente.",
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha inválidos",
  INVALID_PASSWORD: "Senha inválida",
  USER_NOT_FOUND: "Usuário não encontrado",
  INVALID_EMAIL: "E-mail inválido",
  EMAIL_REQUIRED: "E-mail é obrigatório",
  TOO_MANY_ATTEMPTS: "Muitas tentativas. Tente novamente mais tarde.",
  REQUEST_FAILED: "Falha na requisição",
  // Sign in / Sign up
  SIGN_IN: "Entrar",
  SIGN_IN_ACTION: "Entrar",
  SIGN_IN_DESCRIPTION: "Insira seu e-mail abaixo para entrar na sua conta",
  SIGN_UP: "Criar Conta",
  SIGN_UP_ACTION: "Criar uma conta",
  SIGN_UP_DESCRIPTION: "Insira suas informações para criar uma conta",
  FORGOT_PASSWORD: "Esqueci a Senha",
  FORGOT_PASSWORD_LINK: "Esqueceu sua senha?",
  FORGOT_PASSWORD_ACTION: "Enviar link de redefinição",
  FORGOT_PASSWORD_DESCRIPTION: "Insira seu e-mail para redefinir sua senha",
  FORGOT_PASSWORD_EMAIL: "Verifique seu e-mail para o link de redefinição.",
  ALREADY_HAVE_AN_ACCOUNT: "Já tem uma conta?",
  DONT_HAVE_AN_ACCOUNT: "Não tem uma conta?",
  OR_CONTINUE_WITH: "Ou continue com",
  SIGN_IN_WITH: "Entrar com",
  CONTINUE: "Continuar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const neonAuthClient = authClient as any;

  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col font-sans overflow-x-hidden">
        <NeonAuthUIProvider
          authClient={neonAuthClient}
          redirectTo="/"
          emailOTP
          localization={ptBR}
        >
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
