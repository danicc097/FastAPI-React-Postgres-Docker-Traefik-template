# pull official base image
FROM node:14.17-alpine

# set working directory
WORKDIR /frontend

# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /frontend/node_modules/.bin:$PATH

COPY .yarn/ /frontend/.yarn/
COPY package.json /frontend
COPY yarn.lock /frontend
COPY .yarnrc.yml /frontend

RUN yarn

# add app last to prevent reinstalling them when rebuilding
COPY . /frontend

ENV TSC_WATCHFILE "UseFsEventsWithFallbackDynamicPolling" 
CMD ["yarn", "start"]
