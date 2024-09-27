// `nodes` contain any nodes you add from the graph (dependencies)
// `root` is a reference to this program's root node
// `state` is an object that persists across program updates. Store data here.
import { nodes, state, root } from "membrane";

export async function configure({number,personalAccessToken}){
  await nodes.sms.configure({number});
  await nodes.oura.configure({personalAccessToken});
  console.log("Setup done, sending SMS")
  await nodes.sms.send({message:"Oura alerts have been set up"})
  root.check_restingbpm.$cron("0 0 14 * * *");
}
export async function check_restingbpm() {
  const today_bpm = await nodes.oura.sleep.page({pageSize:25}).items.$query(" { average_heart_rate type heart_rate lowest_heart_rate } ");
  // console.log(today_bpm,today_bpm[0].heart_rate.items);
  const filtered: Array<number> = today_bpm.filter((info) => info.type === "long_sleep").map((info) => info.lowest_heart_rate).filter((info) => info !== undefined) as Array<number>
  const recent_average = filtered.slice(0,10).reduce((pv, cv) => { return pv + cv; }, 0)/10;
  await nodes.sms.send({message:"Oura CRON job is working, you can remove this code now."})
  if (filtered[0]-recent_average > 3){
    const alert = `Oura: High resting heart rate detected from recent sleep. Moving average over last 10 records has been ${recent_average}. Most recent resting heart rate is ${filtered[0]}`
    console.log(alert);
    await nodes.sms.send({message:alert})
  }

  // today_bpm.forEach((elt) => console.log(Math.min(elt.heart_rate.items.filter((item) => {
  //   return typeof item === "number"}))))
  // if (){

  // }
}

// export async function run2() {
//   console.log("Hello World");
//   return "test"
// }

// // Handles the program's HTTP endpoint
// export async function endpoint(args) {
//   return `Path: ${args.path}`;
// }
