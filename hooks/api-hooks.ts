/**
 * Hooks auxiliares para consumo da API
 * Camada de abstração para facilitar o uso das funções geradas pelo Orval
 * Inclui tratamento de erros padronizado e tipagem forte
 */

import {
  useOrdersControllerFindOne,
  useOrdersControllerListRastreamentosByOrder,
  useOrdersControllerAtualizarStatus,
  useOrdersControllerListMotivosInterrupcao,
  useOrdersControllerCreateMotivoInterrupcao,
  useOrdersControllerFindAll,
  useOrdersControllerStartTracking,
  useOrdersControllerEndTracking,
  useOrdersControllerGetOrderReport,
  useOrdersControllerCreateEtapa
} from '@/api/generated';
import { useCallback } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

// Tipos para melhorar a segurança e autocompletar
export type OrderStatus = 'pendente' | 'em_andamento' | 'interrompido' | 'concluido';

export interface Produto {
  id: number;
  nome: string;
  codigo: string;
}

export interface Order {
  id: number;
  produto: Produto;
  quantidade: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
  // ... outros campos conforme sua API
}

export interface MotivoInterrupcao {
  id: number;
  descricao: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrackingData {
  ordemId: number;
  etapaId: number;
  funcionarioId: number;
  observacao?: string;
}

export interface OrderReport {
  orderNumber: string;
  product: string;
  efficiency: string;
  trackings: Array<{
    funcionario: string;
    startTime: string;
    endTime: string;
    processedQuantity: number;
    lostQuantity: number;
  }>;
}

export interface Etapa {
  id: number;
  nome: string;
  descricao: string;
  ordemId: number;
  inicio?: string;
  fim?: string;
}

// Utilitário para tratamento de erros
const handleApiError = (error: unknown, context: string): never => {
  const errorMessage = error instanceof Error 
    ? error.message 
    : `Erro desconhecido ao ${context}`;
  
  console.error(`[API Error] ${context}:`, error);
  throw new Error(errorMessage);
};

/**
 * Hook para obter uma ordem pelo ID
 */
export const useGetOrdemById = (id?: number) => {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useOrdersControllerFindOne(id!, {
    query: {
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
      onError: (err) => console.error('Erro ao buscar ordem:', err)
    }
  });

  const getOrdemById = useCallback(async (orderId: number): Promise<Order> => {
    try {
      // Verifica primeiro no cache
      const cachedData = queryClient.getQueryData<Order>(['order', orderId]);
      if (cachedData) return cachedData;

      const response = await refetch({ queryKey: ['order', orderId] });
      if (response.error) throw response.error;
      return response.data as Order;
    } catch (err) {
      return handleApiError(err, `buscar ordem ${orderId}`);
    }
  }, [refetch, queryClient]);

  return {
    data: data as Order | undefined,
    isLoading,
    error,
    getOrdemById
  };
};

/**
 * Hook para listar rastreamentos de uma ordem
 */
export const useListRastreamentosByOrder = (orderId?: number) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useOrdersControllerListRastreamentosByOrder(orderId!, {
    query: {
      enabled: !!orderId,
      onError: (err) => console.error('Erro ao buscar rastreamentos:', err)
    }
  });

  const listRastreamentosByOrder = useCallback(async (id: number) => {
    try {
      const response = await refetch({ queryKey: ['trackings', id] });
      if (response.error) throw response.error;
      return response.data;
    } catch (err) {
      return handleApiError(err, `buscar rastreamentos da ordem ${id}`);
    }
  }, [refetch]);

  return {
    data,
    isLoading,
    error,
    listRastreamentosByOrder
  };
};

/**
 * Hook para atualizar o status de uma ordem
 */
export const useAtualizarStatusOrdem = () => {
  const queryClient = useQueryClient();
  
  const {
    mutateAsync,
    isLoading,
    error,
    reset
  } = useOrdersControllerAtualizarStatus({
    mutation: {
      onError: (err) => console.error('Erro ao atualizar status:', err),
      onSuccess: (_, variables) => {
        // Invalida cache da ordem específica
        queryClient.invalidateQueries(['order', variables.id]);
        // Invalida lista de ordens se necessário
        queryClient.invalidateQueries(['orders']);
      }
    }
  });

  const atualizarStatusOrdem = useCallback(async (
    id: number,
    status: OrderStatus,
    motivoInterrupcaoId?: number
  ): Promise<Order> => {
    try {
      const response = await mutateAsync({
        id,
        data: { status, motivoInterrupcaoId }
      });
      return response as Order;
    } catch (err) {
      return handleApiError(err, `atualizar status da ordem ${id}`);
    }
  }, [mutateAsync]);

  return {
    atualizarStatusOrdem,
    isLoading,
    error,
    resetError: reset
  };
};

/**
 * Hook para listar motivos de interrupção
 */
export const useGetMotivosInterrupcao = () => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useOrdersControllerListMotivosInterrupcao({
    query: {
      staleTime: Infinity, // Motivos raramente mudam
      onError: (err) => console.error('Erro ao buscar motivos:', err)
    }
  });

  const getMotivosInterrupcao = useCallback(async (): Promise<MotivoInterrupcao[]> => {
    try {
      const response = await refetch();
      if (response.error) throw response.error;
      return response.data as MotivoInterrupcao[];
    } catch (err) {
      return handleApiError(err, 'buscar motivos de interrupção');
    }
  }, [refetch]);

  return {
    data: data as MotivoInterrupcao[] | undefined,
    isLoading,
    error,
    getMotivosInterrupcao
  };
};

/**
 * Hook para criar um motivo de interrupção
 */
export const useCreateMotivoInterrupcao = () => {
  const queryClient = useQueryClient();
  
  const {
    mutateAsync,
    isLoading,
    error,
    reset
  } = useOrdersControllerCreateMotivoInterrupcao({
    mutation: {
      onError: (err) => console.error('Erro ao criar motivo:', err),
      onSuccess: () => {
        // Invalida cache de motivos após criação
        queryClient.invalidateQueries(['motivos-interrupcao']);
      }
    }
  });

  const createMotivoInterrupcao = useCallback(async (
    descricao: string
  ): Promise<MotivoInterrupcao> => {
    try {
      const response = await mutateAsync({
        data: { descricao }
      });
      return response as MotivoInterrupcao;
    } catch (err) {
      return handleApiError(err, 'criar motivo de interrupção');
    }
  }, [mutateAsync]);

  return {
    createMotivoInterrupcao,
    isLoading,
    error,
    resetError: reset
  };
};

/**
 * Hook para listar todas as ordens
 */
export const useListOrdens = () => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useOrdersControllerFindAll({
    query: {
      staleTime: 1000 * 30, // 30 segundos de cache
      onError: (err) => console.error('Erro ao listar ordens:', err)
    }
  });

  const listOrdens = useCallback(async (): Promise<Order[]> => {
    try {
      const response = await refetch();
      if (response.error) throw response.error;
      return response.data as Order[];
    } catch (err) {
      return handleApiError(err, 'listar ordens');
    }
  }, [refetch]);

  return {
    data: data as Order[] | undefined,
    isLoading,
    error,
    listOrdens
  };
};

/**
 * Hook para iniciar o rastreamento de uma ordem
 */
export const useStartTracking = () => {
  const {
    mutateAsync,
    isLoading,
    error,
    reset
  } = useOrdersControllerStartTracking({
    mutation: {
      onError: (err) => console.error('Erro ao iniciar rastreamento:', err)
    }
  });

  const startTracking = useCallback(async (
    data: TrackingData
  ): Promise<{ success: boolean }> => {
    try {
      const response = await mutateAsync({ data });
      return { success: !!response };
    } catch (err) {
      return handleApiError(err, 'iniciar rastreamento');
    }
  }, [mutateAsync]);

  return {
    startTracking,
    isLoading,
    error,
    resetError: reset
  };
};

/**
 * Hook para finalizar o rastreamento de uma ordem
 */
export const useEndTracking = () => {
  const {
    mutateAsync,
    isLoading,
    error,
    reset
  } = useOrdersControllerEndTracking({
    mutation: {
      onError: (err) => console.error('Erro ao finalizar rastreamento:', err)
    }
  });

  const endTracking = useCallback(async (
    id: number,
    data: TrackingData
  ): Promise<{ success: boolean }> => {
    try {
      const response = await mutateAsync({ id, data });
      return { success: !!response };
    } catch (err) {
      return handleApiError(err, 'finalizar rastreamento');
    }
  }, [mutateAsync]);

  return {
    endTracking,
    isLoading,
    error,
    resetError: reset
  };
};

/**
 * Hook para obter relatório de uma ordem
 */
export const useGetOrderReport = (id?: number) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useOrdersControllerGetOrderReport(id!, {
    query: {
      enabled: !!id,
      onError: (err) => console.error('Erro ao buscar relatório:', err)
    }
  });

  const getOrderReport = useCallback(async (
    orderId: number
  ): Promise<OrderReport> => {
    try {
      const response = await refetch({ queryKey: ['report', orderId] });
      if (response.error) throw response.error;
      return response.data as OrderReport;
    } catch (err) {
      return handleApiError(err, `gerar relatório da ordem ${orderId}`);
    }
  }, [refetch]);

  return {
    data: data as OrderReport | undefined,
    isLoading,
    error,
    getOrderReport
  };
};

/**
 * Hook para criar uma etapa para uma ordem
 */
export const useCreateEtapa = () => {
  const queryClient = useQueryClient();
  
  const {
    mutateAsync,
    isLoading,
    error,
    reset
  } = useOrdersControllerCreateEtapa({
    mutation: {
      onError: (err) => console.error('Erro ao criar etapa:', err),
      onSuccess: (_, variables) => {
        // Invalida cache da ordem após criar etapa
        queryClient.invalidateQueries(['order', variables.id]);
      }
    }
  });

  const createEtapa = useCallback(async (
    id: number,
    data: { nome: string; descricao: string }
  ): Promise<Etapa> => {
    try {
      const response = await mutateAsync({ id, data });
      return response as Etapa;
    } catch (err) {
      return handleApiError(err, `criar etapa para ordem ${id}`);
    }
  }, [mutateAsync]);

  return {
    createEtapa,
    isLoading,
    error,
    resetError: reset
  };
};