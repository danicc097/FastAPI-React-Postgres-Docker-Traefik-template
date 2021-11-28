-- Running downgrade 824585145a4a -> 72123f20bcb6
DROP TABLE public.global_notifications;

-- Running downgrade 72123f20bcb6 ->
DROP TABLE public.pwd_reset_req;

DROP TABLE public.profiles;

DROP TABLE public.users;

DROP FUNCTION public.update_updated_at_column;
