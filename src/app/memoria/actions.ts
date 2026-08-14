"use server";

import { salvarMemoria } from "@/lib/data";
import { revalidatePath } from "next/cache";

export async function salvarMemoriaAction(arquivo: string, conteudo: string): Promise<{ ok: boolean; erro?: string }> {
  const r = salvarMemoria(arquivo, conteudo);
  if (r.ok) {
    revalidatePath("/memoria");
    revalidatePath("/");
  }
  return r;
}
