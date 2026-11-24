import { requisitar } from './http.js';

export const listarEstoques = () => requisitar('/estoques');
export const buscarEstoque = (id) => requisitar(`/estoques/${id}`);
export const criarEstoque = (dados) => requisitar('/estoques', { metodo: 'POST', corpo: dados });
export const atualizarEstoque = (id, dados) =>
  requisitar(`/estoques/${id}`, { metodo: 'PUT', corpo: dados });
export const excluirEstoque = (id) => requisitar(`/estoques/${id}`, { metodo: 'DELETE' });
