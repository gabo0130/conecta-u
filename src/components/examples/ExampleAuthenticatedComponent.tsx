"use client";

import { useAuth } from "@/contexts/auth-context";
import { useApiClient } from "@/hooks/useApiClient";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
}

/**
 * Ejemplo de componente que:
 * 1. Verifica autenticación
 * 2. Consume API con token automático
 * 3. Renderiza datos seguros
 */
export function ExampleAuthenticatedComponent() {
  const { user, isAuthenticated } = useAuth();
  const api = useApiClient();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      setError("No tienes permisos para ver este recurso");
      setLoading(false);
      return;
    }

    // Cargar datos con el token incluido automáticamente
    const loadItems = async () => {
      try {
        const response = await api.get("/items?limit=10");
        setItems(response.data.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        } else if (err.response?.status === 403) {
          setError("No tienes permisos para ver este recurso");
        } else {
          setError(err.message || "Error al cargar los datos");
        }
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [isAuthenticated, user?.role, api]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!isAuthenticated) {
    return <div>Por favor, inicia sesión</div>;
  }

  return (
    <div>
      <h2>Datos (Usuario: {user?.name})</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
