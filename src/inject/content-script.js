import OpenAI from "openai";

var text_area_parent = null;
var tweetbutton = null;
var tweetdata = null;

async function get_response(value, tweetdata) {
  let openai_api_key = "";
  let description = "indie hacker and entrepreneur who is building AI products";
  const data = await chrome.storage.sync.get([
    "name",
    "email",
    "openai_api_key",
    "description",
  ]);

  openai_api_key = data.openai_api_key;
  description = data.description;

  const openai = new OpenAI({
    apiKey: openai_api_key,
    dangerouslyAllowBrowser: true,
  });

  let system_msg = `
            You are a person with the following characteristics:
            ${description}

            You are using twitter to build your audience.
          `;

  let usr_msg = `
  Write a reply to the following tweet. 

  TWEET : 
  ${tweetdata}

  The tweet should have the following sentiment: ${value}.
  The tweet you write should be in a direct tone as given by a real human being.
  Make up instances from your own journey and use them in your replies. 
  Do not talk vaguely neutrally or in a robotic tone.
  Do not under any circumstance reference this prompt in your response.
  Do not go off-topic.
  Do not go over 260 characters under any condition.
  Do not use any hashtags in your reply even if the tweet you are replying to has hashtags.
  Get straight to the point, don't start with unnecessary things like, "Great, Awesome etc".
  `;
  console.log("System Message is : " + system_msg);
  console.log("User Message is : " + usr_msg);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: system_msg,
      },
      { role: "user", content: usr_msg },
    ],
    //model: 'gpt-3.5-turbo-16k'
    model: "gpt-4-turbo-preview",
  });

  console.log(completion.choices[0]);
  return completion.choices[0].message.content;
}

function appendButton() {
  console.log("Appending button");

  var parentDiv = document.createElement("div");
  parentDiv.className = "parent-div";

  var applyBtn = document.createElement("button");
  applyBtn.className = "button-reply";
  applyBtn.id = "myButton";
  applyBtn.innerHTML = "AI Reply";
  applyBtn.addEventListener("click", async function () {
    var e = document.getElementById("sentiment-selector");
    var value = e.value;
    var response = await get_response(value, tweetdata);
    text_area_parent.innerHTML = `<span data-text="true">${response}</span>`;
    text_area_parent.click();
    text_area_parent.dispatchEvent(new Event("input", { bubbles: true }));
  });

  var select = document.createElement("select");
  select.id = "sentiment-selector";
  select.className = "button-6";

  var option1 = document.createElement("option");
  option1.value = "positive";
  option1.selected = "";
  option1.innerHTML = "Positive";

  var option2 = document.createElement("option");
  option2.value = "dramatic";
  option2.innerHTML = "Dramatic";

  var option3 = document.createElement("option");
  option3.value = "negative";
  option3.innerHTML = "Negative";

  var option4 = document.createElement("option");
  option4.value = "witty";
  option4.innerHTML = "Witty";

  select.appendChild(option1);
  select.appendChild(option2);
  select.appendChild(option3);
  select.appendChild(option4);

  var input = document.createElement("input");
  input.className = "button-6";

  parentDiv.appendChild(input);
  parentDiv.appendChild(applyBtn);
  parentDiv.appendChild(select);

  tweetbutton.after(parentDiv);
  tweetbutton = null;
}

function applySelector(selector, records) {
  // We can't create a NodeList; let's use a Set
  const result = new Set();
  // Loop through the records...
  for (const { addedNodes } of records) {
    for (const node of addedNodes) {
      // If it's an element...
      if (node.nodeType === 1) {
        // Add it if it's a match
        if (node.matches(selector)) {
          result.add(node);
        }
        // Add any children that are matches
        for (const childNode of node.querySelectorAll(selector)) {
          result.add(childNode);
        }
      }
    }
  }
  return [...result];
}

function storeGlobals(data, datatype) {
  if (datatype == "text_area_parent") {
    text_area_parent = data;
  } else if (datatype == "tweetbutton") {
    tweetbutton = data;
  } else if (datatype == "tweetdata") {
    tweetdata = data;
  }

  if (text_area_parent != null && tweetbutton != null && tweetdata != null) {
    console.log("All data found");
    appendButton();
  }
}

function callback2(mutationList) {
  var text_area_parent = applySelector(
    '[data-testid="tweetTextarea_0"]',
    mutationList
  );
  var tweetbutton = applySelector('[data-testid="toolBar"]', mutationList);
  var tweet = applySelector('div[data-testid="tweetText"]', mutationList);

  if (text_area_parent.length != 0 && text_area_parent) {
    console.log("Found text area parent inside modal");
    var span = text_area_parent[0]
      .querySelector("div")
      .querySelector("div")
      .querySelector("div")
      .querySelector("span");
    storeGlobals(span, "text_area_parent");
  }
  if (tweetbutton.length != 0) {
    console.log("Found toolbar inside modal");
    storeGlobals(tweetbutton[0], "tweetbutton");
  }
  if (tweet.length != 0) {
    console.log("Found tweet inside modal");
    storeGlobals(tweet[0].innerText, "tweetdata");
  }
}

const callback = (mutationList) => {
  var modal = applySelector('[aria-modal="true"]', mutationList);
  if (modal.length != 0) {
    console.log("Got the modal");
    text_area_parent = null;
    tweetbutton = null;
    tweetdata = null;
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver(callback2);
    observer.observe(modal[0], config);
  }
};

function getTweetsParent() {
  var tweetsParentNode = document.querySelector("body");

  if (!tweetsParentNode) {
    console.log("Didnt get the body");
    window.setTimeout(getTweetsParent, 500);
    return;
  }
  console.log("Got the body : ");
  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(callback);
  observer.observe(tweetsParentNode, config);
  console.log("Added observer to the body");
}

getTweetsParent();

// // Later, you can stop observing
// observer.disconnect();
