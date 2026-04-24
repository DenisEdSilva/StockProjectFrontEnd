# StockProject Dashboard 🚀

Interface web para gestão de inventário multi-tenant com controle granular de acesso e foco em experiência do usuário.

---

## 📌 Visão Geral

O **StockProject Dashboard** é o frontend da aplicação, responsável por:

* Interação com o usuário
* Visualização de dados em tempo real
* Controle de permissões no cliente
* Experiência fluida e responsiva

---

## 🛠 Tech Stack

* **Framework:** Next.js (App Router)
* **Linguagem:** TypeScript
* **Estado & Cache:** TanStack Query v5
* **UI:** ShadcnUI + Radix UI
* **Estilo:** TailwindCSS
* **Formulários:** React Hook Form + Zod

---

## 🌟 Funcionalidades

### 🔐 RBAC + Exceções

* Permissões base por cargo
* Exceções individuais por usuário

### 📦 Controle de Estoque

* IN / OUT / TRANSFER
* Reversão de movimentações

### 🔄 Sincronização em Tempo Real

Uso do React Query para cache e atualização automática

### 🧠 Inteligência de SKU

Geração automática de código quando necessário

### 🖼 Resiliência de Imagem

* Fallback automático
* Validação de URLs

---

## 🏗 Arquitetura

```
src/
 ├── services/     # API layer
 ├── hooks/        # lógica reutilizável (auth, RBAC)
 ├── components/   # UI + lógica de negócio
 ├── types/        # tipagens globais
```

---

## 📦 Setup

```bash
git clone https://github.com/DenisEdSilva/StockProjectFrontEnd.git

npm install

npm run dev
```

---

## 🔧 Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

---

## 🔗 Integração com API

* Comunicação via REST
* Autenticação com JWT
* Controle de acesso sincronizado com RBAC do backend

---

## 🎯 Boas Práticas Aplicadas

* Separação de responsabilidades
* Componentização
* Tipagem forte com TypeScript
* Validação com schema (Zod)
* Cache inteligente

---

## 👤 Autor

Desenvolvido por Denis Eduardo da Silva 🚀
