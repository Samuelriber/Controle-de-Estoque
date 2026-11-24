import { requisitar } from './http.js';

export const listarMercadorias = () => requisitar('/mercadorias');
export const buscarMercadoria = (id) => requisitar(`/mercadorias/${id}`);
export const criarMercadoria = (dados) => requisitar('/mercadorias', { metodo: 'POST', corpo: dados });
export const atualizarMercadoria = (id, dados) =>
  requisitar(`/mercadorias/${id}`, { metodo: 'PUT', corpo: dados });
export const excluirMercadoria = (id) => requisitar(`/mercadorias/${id}`, { metodo: 'DELETE' });
