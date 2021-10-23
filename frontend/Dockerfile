# pull official base image
FROM node:14.17-alpine

# set working directory
WORKDIR /frontend

# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /frontend/node_modules/.bin:$PATH

COPY package.json /frontend
COPY yarn.lock /frontend
COPY .yarnrc.yml /frontend
COPY .yarn/releases/yarn-3.0.2.cjs /frontend/.yarn/releases/

RUN yarn set version berry
RUN yarn set version 3.0.2
RUN yarn install
# this is not installed with npm install (even though is in regular packages)
RUN npm install -g react-scripts@4.0.3

# add app last to prevent reinstalling them when rebuilding
COPY . /frontend

CMD ["yarn", "start"]
