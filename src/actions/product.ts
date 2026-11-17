"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function createProduct(formData: FormData) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem cadastrar produtos." };
    }

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const priceStr = (formData.get("price") as string) || "";
    const price = parseFloat(priceStr.replace(",", "."));
    const imageUrl = (formData.get("imageUrl") as string) || null;
    const videoUrl = (formData.get("videoUrl") as string) || null;
    const isAvailable = formData.get("isAvailable") === "true";
    const stock = parseInt((formData.get("stock") as string) || "0", 10);
    const isSubscription = formData.get("isSubscription") === "true";
    const billingCycle = (formData.get("billingCycle") as string) || null;

    const featuresStr = (formData.get("featuresString") as string) || "";
    const features = featuresStr
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f);

    const faqJson = (formData.get("faqJson") as string) || "[]";
    let faq = [];
    try {
      faq = JSON.parse(faqJson);
    } catch {
      faq = [];
    }

    if (!name || !description || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return { success: false, error: "Preencha todos os campos obrigatórios corretamente." };
    }

    await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        videoUrl,
        isAvailable,
        stock,
        isSubscription,
        billingCycle,
        features,
        faq,
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/sistemas");
    revalidatePath("/produtos");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao criar o produto." };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem atualizar produtos." };
    }

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const priceStr = (formData.get("price") as string) || "";
    const price = parseFloat(priceStr.replace(",", "."));
    const imageUrl = (formData.get("imageUrl") as string) || null;
    const videoUrl = (formData.get("videoUrl") as string) || null;
    const isAvailable = formData.get("isAvailable") === "true";
    const stock = parseInt((formData.get("stock") as string) || "0", 10);
    const isSubscription = formData.get("isSubscription") === "true";
    const billingCycle = (formData.get("billingCycle") as string) || null;

    const featuresStr = (formData.get("featuresString") as string) || "";
    const features = featuresStr
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f);

    const faqJson = (formData.get("faqJson") as string) || "[]";
    let faq = [];
    try {
      faq = JSON.parse(faqJson);
    } catch {
      faq = [];
    }

    if (!name || !description || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return { success: false, error: "Preencha todos os campos obrigatórios corretamente." };
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        imageUrl,
        videoUrl,
        isAvailable,
        stock,
        isSubscription,
        billingCycle,
        features,
        faq,
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/sistemas");
    revalidatePath("/produtos");
    revalidatePath(`/produto/${id}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao atualizar o produto." };
  }
}

export async function deleteProduct(id: string) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return { success: false, error: "Acesso negado. Apenas administradores podem excluir produtos." };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/sistemas");
    revalidatePath("/produtos");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao deletar o produto. Pode haver pedidos vinculados a ele." };
  }
}
