FROM node:12 as build

ENV WORKDIR /usr/src/app
WORKDIR ${WORKDIR}

COPY package.json .
RUN npm install

COPY . .
RUN git apply --ignore-whitespace patches/typedarray-pool+1.2.0.patch
RUN npm run build
RUN rm -rf src
RUN rm -rf ui

RUN chmod +x env.sh

FROM nginx:stable-alpine
ENV PORT 8080
COPY --from=build /usr/src/app/dist/angular-starter/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY env.sh /usr/bin/
RUN chmod +x /usr/bin/env.sh

EXPOSE ${PORT}
ENTRYPOINT ["sh", "/usr/bin/env.sh"]
CMD ["nginx", "-g", "daemon off;"]
