//@ts-ignore
export function GetAllNews(call, callback) {
    let news = [
        { _id: "1", name: "Note 1", description: "Content 1"},
        { _id: "2", name: "Note 2", description: "Content 2"},
      ];
    callback(null,{"news": news});
}

//@ts-ignore
export function Test(call, callback) {
    callback(null,{"message": "hello"});
}
  