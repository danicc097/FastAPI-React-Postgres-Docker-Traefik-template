FROM postgres:13

RUN apt-get update \
  && BUILD_DEPS='git make libpq-dev libffi-dev musl-dev gcc musl-dev postgresql-server-dev-13 systemtap-sdt-dev' \
  && DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y ${BUILD_DEPS} \
  && apt-get clean \
  && git clone https://github.com/postgrespro/rum --branch 1.3.9 --single-branch \
  && cd rum \
  && make PG_CONFIG=/usr/lib/postgresql/13/bin/pg_config USE_PGXS=1 \
  && make PG_CONFIG=/usr/lib/postgresql/13/bin/pg_config USE_PGXS=1 install \
  # && make PG_CONFIG=/usr/lib/postgresql/13/bin/pg_config USE_PGXS=1 installcheck \
  # pgxn has rum 1.1.0
  # && USE_PGXS=1 PG_CONFIG=/usr/lib/postgresql/13/bin/pg_config pgxn install rum \
  && apt-get autoremove -y ${BUILD_DEPS} \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists /tmp/* /var/tmp/*

USER postgres
EXPOSE 5432

# bind mount Postgres volumes for persistent data
# VOLUME ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]
