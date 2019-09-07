import { Container } from "typedi";
import { ServiceContext, ServiceFactory } from "typescript-rest";

/**
 * Provider TypeScript Rest Service class implementations from TypeDI Container.
 */
export class TypeDIServiceFactory implements ServiceFactory {
    public create(serviceClass: any, context: ServiceContext) {
        return Container.get(serviceClass);
    }

    public getTargetClass(serviceClass: any) {
        return serviceClass as FunctionConstructor;
    }
}
