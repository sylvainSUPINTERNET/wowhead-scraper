const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "../proto/news.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const NewsService = grpc.loadPackageDefinition(packageDefinition).NewsService;



const client = new NewsService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );


  //@ts-ignore
  client.GetAllNews({}, (err, response) => {
    console.log("CALLED");
    console.log(err);
    console.log(response);
  })

//@ts-ignore
client.Test({name : "tuto"}, (err, response) => {
    console.log(response);
})