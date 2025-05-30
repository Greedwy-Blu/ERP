/**
 * Generated by orval v7.5.0 🍺
 * Do not edit manually.
 * NestJS API
 * API documentation for NestJS with Swagger, Orval, and MikroORM
 * OpenAPI spec version: 1.0
 */
import type { Order } from './order';
import type { Funcionario } from './funcionario';

export interface Etapa {
  /** ID único da etapa */
  id: number;
  /** Nome da etapa */
  nome: string;
  /** Pedido associado */
  order: Order;
  /** Funcionário responsável */
  funcionario: Funcionario;
  /** Horário de início da etapa */
  inicio?: string;
  /** Horário de término da etapa */
  fim?: string;
}
