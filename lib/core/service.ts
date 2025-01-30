import { Result } from "./error-handler";

export interface IBaseService<T> {
  getAll(): Promise<Result<T[]>>;
  getById(id: string): Promise<Result<T>>;
}

export interface ISingletonService<T> {
  getData(): Promise<Result<T>>;
}

export interface IServiceConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export abstract class BaseService<T> implements IBaseService<T> {
  protected config: IServiceConfig;

  constructor(config: IServiceConfig = {}) {
    this.config = {
      baseUrl: "",
      headers: {},
      ...config,
    };
  }

  abstract getAll(): Promise<Result<T[]>>;
  abstract getById(id: string): Promise<Result<T>>;
}

export abstract class SingletonService<T> implements ISingletonService<T> {
  protected config: IServiceConfig;

  constructor(config: IServiceConfig = {}) {
    this.config = {
      baseUrl: "",
      headers: {},
      ...config,
    };
  }

  abstract getData(): Promise<Result<T>>;
}
