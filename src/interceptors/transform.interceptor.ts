import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { THttpSuccessResponse, EStatus } from '@app/interfaces/http.interface';
import { TMessage } from '@app/interfaces/http.interface';
import * as META from '@app/constants/meta.constant';
import * as TEXT from '@app/constants/text.constant';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, THttpSuccessResponse<T>> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, call$: Observable<T>): Observable<THttpSuccessResponse<T>> {
    const target = context.getHandler();
    const message = this.reflector.get<TMessage>(META.HTTP_SUCCESS_MESSAGE, target) || TEXT.HTTP_DEFAULT_SUCCESS_TEXT;
    const usePaginate = this.reflector.get<boolean>(META.HTTP_RES_TRANSFORM_PAGINATE, target);
    return call$.pipe(map((data: any) => {
      const result = !usePaginate ? data : {
        data: data.docs,
        pagination: {
          total: data.total,
          current_page: data.page,
          total_page: data.pages,
          per_page: data.limit,
        },
      };
      return { status: EStatus.Success, message, result };
    }));
  }
}