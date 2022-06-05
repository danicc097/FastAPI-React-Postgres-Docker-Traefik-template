# dont use, we want to use the same conn for all services
# def get_service(Service_type: Type[BaseService]) -> Callable[[AsyncConnection], BaseService]:
#     def get_service(conn: AsyncConnection = Depends(get_async_conn)) -> BaseService:
#         return Service_type(conn)

#     return get_service
