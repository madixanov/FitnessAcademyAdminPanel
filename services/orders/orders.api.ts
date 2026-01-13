import { apiClient } from "../apiClient";

// ------------------------------------
// Payload для создания / обновления заказа
// ------------------------------------
export interface OrderPayload {
  courseId: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "COMPLETED";
}

// ------------------------------------
// Order entity
// ------------------------------------
export interface Order extends OrderPayload {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
}

export interface OrderWithDetails extends Order {
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role?: string;
    status?: string;
    img?: string;
  };
  course?: {
    id: string;
    name: string;
    price?: number;
  };
}

// ------------------------------------
// Получить все заказы
// GET /orders
// ------------------------------------
export async function getOrders(): Promise<Order[]> {
  try {
    return await apiClient<Order[]>("/orders/allOrders");
  } catch (err: any) {
    console.error("Ошибка при получении orders:", err.message);
    return [];
  }
}

// ------------------------------------
// Обновить статус заказа
// PATCH /orders/:id
// ------------------------------------
export async function patchOrder(
  id: string,
  payload: { status: "ACTIVE" | "INACTIVE" | "PENDING" | "COMPLETED" }
): Promise<Order> {
  return await apiClient<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ------------------------------------
// Удалить заказ
// DELETE /orders/:id
// ------------------------------------
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await apiClient(`/orders/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err: any) {
    console.error(`Ошибка при удалении order ${id}:`, err.message);
    return false;
  }
}
