export type EnvConfig = {
  apiBaseUrl: string;
  socketUrl: string;
};

export function envConfig(): EnvConfig {
  return {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "",
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL?.trim() ?? "",
  };
}
