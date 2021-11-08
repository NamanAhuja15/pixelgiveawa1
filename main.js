const dapp = "WaxCPULoan";
const endpoint = "testnet.wax.pink.gg";
const chainId =
  "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12";
const tokenContract = { WAX: "eosio.token" };
const menuPrices = [1, 2, 4];
const pools = [
  {
    name: "Pool 1",
    url: "https://cpuloanpools.github.io/cpuloanpools/",
    contract: "cpuloanstak1",
  },
  {
    name: "Pool 2",
    url: "https://cpuloanpools.github.io/cpuloanpools/SecondPool/",
    contract: "cpuloantests",
  },
  {
    name: "Pool 3",
    url: "https://cpuloanpools.github.io/cpuloanpools/ThirdPool/",
    contract: "cpuloantests",
  },
  {
    name: "Pool 4",
    url: "https://cpuloanpools.github.io/cpuloanpools/FourthPool/",
    contract: "cpuloantests",
  },

  //{ name: "x2 pool", url: "/x2pool/", contract: "x2waxcpuloan" },
];

var anchorAuth="owner";
var isauth=false;
main();
async function main() {
  loggedIn = false;
  configPromise = GetConfig();
  config = await configPromise;
  resultPromise=GetResults();
  results=await resultPromise;
    PopulateResultList();
    autoLogin();

    
 checkuser=GetAuthUsers();
 checkauth= await checkuser;
 
 isauth=check_auth();

if(!isauth)
 document.getElementById("controls").style.visibility="hidden";

  PopulateMenu();


 
}

function check_auth()
{
  
 if(loggedIn)
 {
 for(i=0;i<checkauth.length;i++)
 {
   if(checkauth[i].account==wallet_userAccount)
   return true;
 }
}
return false;
}

function ShowAuthControls()
{
  console.log(isauth);
  if(isauth)
  {
  ShowAdminControls();

}}

async function create_giveaway() {

  var id= document.getElementById("giveawayID").value;
  var authorised_account= document.getElementById("authorised_account").value;
  var entrycost= document.getElementById("entrycost").value;
  var contract_account= document.getElementById("contract_account").value;
  var loop_time_seconds= document.getElementById("loop_time_seconds").value;
  var max_users= document.getElementById("max_users").value;
  var templateID= document.getElementById("templateID").value;
  var quantity_req= document.getElementById("quantity_req").value;

  console.log(entrycost);
  console.log(contract_account);
  console.log(quantity_req);
  console.log(quantity_req);
  
  if (loggedIn) {
    HideMessage();
    try {

      var data1=
      {
        id:id,
        authorised_account:authorised_account,
        entrycost:entrycost,
        contract_account:contract_account,
        loop_time_seconds:loop_time_seconds,
        max_users:max_users,
        asset_ids:[],
        templateID:templateID,
        quantity_req:quantity_req,
      };
      const result = await wallet_transact([
        {
          account: contract,
          name: "create",
          authorization: [{ actor: wallet_userAccount, permission: anchorAuth }],
          data:data1 ,
        },
      ]);
      ShowMessage(
        '<div class="complete">Success</div><div class="link"><a href="https://wax.bloks.io/transaction/' +
          result.transaction_id +
          '?tab=traces">View transaction</a></div>'
      );
      main();
    } catch (e) {
      ShowToast(e.message);
    }
  } else {
    WalletListVisible(true);
  }

}

async function announcespin(id) {
  current=config[id];

  if (loggedIn) {
    HideMessage();
    try {
      const result = await wallet_transact([
        {
          account: contract,
          name: "announcespin",
          authorization: [{ actor: wallet_userAccount, permission: anchorAuth }],
          data: {
            id: current.campaign_id
          },
        },
      ]);
      ShowMessage(
        '<div class="complete">Success</div><div class="link"><a href="https://wax.bloks.io/transaction/' +
          result.transaction_id +
          '?tab=traces">View transaction</a></div>'
      );
      main();
    } catch (e) {
      ShowToast(e.message);
    }
  } else {
    WalletListVisible(true);
  }

}

async function join(id) {
  current=config[id];

  if (loggedIn) {
    HideMessage();
    var amount = 1 + " " + "WAX";
    try {
      const result = await wallet_transact([
        {
          account: current.gv_contract,
          name: "transfer",
          authorization: [{ actor: wallet_userAccount, permission: anchorAuth }],
          data: {
            from: wallet_userAccount,
            to: contract,
            quantity: current.entrycost,
            memo: current.campaign_id,
          },
        },
      ]);
      ShowMessage(
        '<div class="complete">Success</div><div class="link"><a href="https://wax.bloks.io/transaction/' +
          result.transaction_id +
          '?tab=traces">View transaction</a></div>'
      );
      main();
    } catch (e) {
      ShowToast(e.message);
    }
  } else {
    WalletListVisible(true);
  }

}

async function GetAuthUsers() {
  var path = "/v1/chain/get_table_rows";

  var data = JSON.stringify({
    json: true,
    code: "pixelgiveawy",
    scope: "pixelgiveawy",
    table: "authusers",
    limit: 1000,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: { "Content-Type": "text/plain" },
    body: data,
    method: "POST",
  });

  const body = await response.json();

  let auth_users=[]; 
  for(i=0;i<body.rows.length;i++)
  {
    auth_users.push({
      account: body.rows[i].account,  
      campaigns_perday: body.rows[i].campaigns_perday,  
      day_start_time: body.rows[i].day_start_time,
      campaigns_today:body.rows[i].campaigns_today
    });
  }

  if (auth_users.length >= 1) { 
    return auth_users;
  } else {
    ShowToast("Unexpected response retrieving results");
    return { Valid: false };
  } /* */


}

async function GetResults() {
  var path = "/v1/chain/get_table_rows";

  var data = JSON.stringify({
    json: true,
    code: "pixelgiveawy",
    scope: "pixelgiveawy",
    table: "results",
    limit: 1000,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: { "Content-Type": "text/plain" },
    body: data,
    method: "POST",
  });

  const body = await response.json();

  let results=[]; 

  if(body.rows.length==0) return results;
  for(i=0;i<body.rows.length;i++)
  {
    results.push({
      id:parseInt(body.rows[i].id ),
      campaign_id: parseInt(body.rows[i].campaign_id ),
      asset_id:body.rows[i].asset_id ,
      winner:body.rows[i].winner,
      roll_time:body.rows[i].roll_time,
    });
  }

  if (body.rows && Array.isArray(body.rows) && body.rows.length >= 1) { 
    return results;
  } else {
    ShowToast("Unexpected response retrieving results");
    return { Valid: false };
  } /* */


}

async function GetAssets(assetIDs) {
  let results=[];

  for(i=0;i<assetIDs.length;i++)
  {

    var path = "atomicassets/v1/assets/"+assetIDs[i];

  const response = await fetch("https://" + "test.wax.api.atomicassets.io/" + path, {
    headers: { "Content-Type": "text/plain" },
    method: "POST",
  });

  const body = await response.json();

    results.push({
      asset_id: parseInt(body.data.asset_id ),
      img:body.data.data.img 
    });
}

  if (results.length>0) { 
    return results;
  } else {
    ShowToast("Unexpected response retrieving results");
    return { Valid: false };
  } /* */
}

async function GetConfig() {
  var path = "/v1/chain/get_table_rows";

  var data = JSON.stringify({
    json: true,
    code: "pixelgiveawy",
    scope: "pixelgiveawy",
    table: "campaigns",
    limit: 150,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: { "Content-Type": "text/plain" },
    body: data,
    method: "POST",
  });

  const body = await response.json();
  console.log(body);

  let campaigns=[];
  for(i=0;i<body.rows.length;i++)
  {
    if(body.rows[i].asset_ids.length!=0)
    campaigns.push({
      campaign_id: parseInt(body.rows[i].id),
      entrycost: body.rows[i].entrycost,
      account: body.rows[i].authorised_account,
      assets: body.rows[i].asset_ids,
      entrants: body.rows[i].accounts,
      max_acc_size: body.rows[i].max_users,
      last_roll: body.rows[i].last_roll,
      timer: body.rows[i].loop_time_seconds,
      templateID: body.rows[i].templateID,
      q_needed: body.rows[i].quantity_req,
      gv_contract: body.rows[i].contract_account
    });
  }
console.log(campaigns);
  if (body.rows && Array.isArray(body.rows) && body.rows.length >= 1) { 
    return campaigns;
  } else {
    ShowToast("Unexpected response retrieving config");
    return { Valid: false };
  } /* */
}


function ShowAdminControls() {
  var controls = "";
  var symbol = "WAX";
  var menu ="AUTH USER CONTROLS";
  for (var index = 0; index < config.length; ++index) {
    console.log(config[index].account);
    if(config[index].account==wallet_userAccount  )
    {
    var disabled = config[index].assets.length>0? "" : " disabled";
    var datex=Date.parse(config[index].last_roll);
    var now= new Date();
    var date=Math.floor(datex/1000);    
    const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)  
    const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000) 
    
    

    var ts = utcSecondsSinceEpoch-date>config[index].timer?0:(date+config[index].timer)-utcSecondsSinceEpoch;
    console.log(utcSecondsSinceEpoch-date>config[index].timer);
    var disabled = config[index].assets.length>0? "" : " disabled";

    menu += '<div  class="menuentry"> <table><tr>';
    menu += '<td class="stakeamount">' +"campaign ID "+ config[index].campaign_id ;
    menu += '<br>'  +"By "+ config[index].account+
    '<br>' +"Entry cost  "+ config[index].entrycost +'<br>' + "Total entries " +config[index].entrants.length+" / "+config[index].max_acc_size
    +'<br>' +"assets in pool "+ config[index].assets.length +'<br>' + "Time to roll "+ ts+" seconds"+  "</td>"+
      '<tr><td><button id="spin' +
        index +
        '" class="buy" onclick=' +
        "announcespin(" +
        index +
        ")" +disabled+">Announce Spin "+
        "</button></td>";


    menu += "</tr></table></div>";
    }
  }
  menu+= "Create a new giveaway -<br><table>"
  +"<tr> <div id='giveaway_ID'>Giveaway ID <input type='number' id='giveawayID' name='giveawayID'"+
  +"pattern='\d*' value='1' autofocus> </div></tr>"
  +"<tr> <div id='auth_acc'>Authorised account <input type='text' id='authacc' name='authacc'"+
  +"pattern='\d*' value='' autofocus> </div></tr>"
  +"<tr> <div id='entrycost'>entrycost <input type='text' id='entry_cost' name='entrycost'"+
  +"pattern='\d*' value='' autofocus> </div></tr>"
  +"<tr> <div id='contract_account'>contract_account <input type='text' id='contractccount' name='contract_account'"+
  +"pattern='\d*' value='' autofocus> </div></tr>"
  +"<tr> <div id='loop_time_seconds'>loop_time_seconds <input type='number' id='timeinput' name='timeinput'"+
  +"pattern='\d*' value='1' autofocus> </div></tr>"
  +"<tr> <div id='users'>max users<input type='number' id='timeinput' name='timeinput'"+
  +"pattern='\d*' value='1' autofocus> </div></tr>"
  +"<tr> <div id='templateID'>templateID <input type='number' id='timeinput' name='timeinput'"+
  +"pattern='\d*' value='1' autofocus> </div></tr>"
  +"<tr> <div id='quantity_req'>quantity required <input type='number' id='timeinput' name='timeinput'"+
  +"pattern='\d*' value='1' autofocus></div> </tr>"
  +'<tr><td><button id="spin' +
  index +
  '" class="buy" onclick=' +
  "create_giveaway(" +

  ")" +">Create Giveaway "+
  "</button></td>";
  +"</table>"

  var v= document.getElementById("giveawayID");
  console.log(v);

  document.getElementById("controls").innerHTML = menu;
}

function PopulateMenu() {
  var menu = "";
  var symbol = "WAX";
  console.log(config.length);
  for (var index = 0; index < config.length; ++index) {
    console.log(config[index].account);
    var disabled = config[index].assets.length>0? "" : " disabled";
    var datex=Date.parse(config[index].last_roll);
    var now= new Date();
    var date=Math.floor(datex/1000);    
    const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)  
    const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000) 
    
    

    var ts = utcSecondsSinceEpoch-date>config[index].timer?0:(date+config[index].timer)-utcSecondsSinceEpoch;
    console.log(utcSecondsSinceEpoch-date);
    
    menu += '<div  class="menuentry"><table><tr>';
    menu += '<td class="stakeamount">' +"campaign ID "+ config[index].campaign_id ;
    menu += '<br>'  +"By "+ config[index].account +
    '<br>' +"Entry cost  "+ config[index].entrycost +'<br>' + "Total entries " +config[index].entrants.length+" / "+config[index].max_acc_size
    +'<br>' +"assets in pool "+ config[index].assets.length +'<br>' + "Time to roll "+ ts+ " seconds"+ "</td>"+
    '<tr><td><button id="join' +
      index +
      '" class="buy" onclick=' +
      "join(" +
      index +
      ")" +">JOIN NOW "+
      "</button></td>"+
      '<tr><td><button id="see_assets' +
        index +
        '" class="buy" onclick=' +
        "seeassets(" +
        index +
        ")" +">See assets in pool "+
        "</button></td>";
    menu += "</tr></table></div>";
  }
  document.getElementById("menu").innerHTML = menu;
}

function PopulateResultList() {
  var html = '<div  id="results">'+"RESULTS"+"<br>";
  let src = "https://ipfs.wecan.dev/ipfs/";   
  let src2="https://wax-test.atomichub.io/explorer/asset/";

  for (var index = results.length-1; index >=0; --index) {
    html +=
      '<div  class="results">'+
      "ID: "+results[index].id  +"<br>"+
      "campaign ID: "+results[index].campaign_id  +

      "<br>"+"Asset won:<a href=" +
      src2 +results[index].asset_id+
      ' "style="text-decoration:underline;" target="_blank" >' +results[index].asset_id+"</a>"+
      "<br>"+"Winner: "+results[index].winner+
      "<br>"+"roll_time: "+results[index].roll_time+
      "</div>"+
      "<br>";

  }
  html += "</div>";
  document.getElementById("results").innerHTML = html;


}

async function seeassets(campaign_id) {
  current=config[campaign_id];

  const assetPromise=GetAssets(current.assets);
  const assets=await assetPromise;
  console.log(assets);
  var html = '<div  id="assets">'+"Assets in campaign"+current.campaign_id+"<br>";
  let src = "https://ipfs.wecan.dev/ipfs/";   
  let src2="https://wax-test.atomichub.io/explorer/asset/";

  for(i=0;i<assets.length;i++)
{

  var img = assets[i].img;
  html+="<div class='nftimg'> <img src="+ src + img +"></div>";
  html +=
  '<div  class="pools_td"><a href="' +
  src2 +assets[i].asset_id+
  ' "style="text-decoration:underline;" target="_blank" >' +
  "<div id="+assets[i].asset_id+">"+"AssetID "+assets[i].asset_id
  " </a></div>";
}
html += "</div>";

  document.getElementById("assets").innerHTML = html;
}

function CustomInputChanged() {
  var element = document.getElementById("custominput");
  element.value = parseInt(element.value);
  var valid = element.value > 0;
  var timeMultiplier = GetTimeMultiplier();
  document.getElementById("customamount").innerHTML =
    (timeMultiplier * element.value) / config.Multiplier;
  document.getElementById("buy" + menuPrices.length).disabled = !valid;
}

function TimeInputChanged() {
  var textValue = document.getElementById("timeinput").value;
  if (textValue.length > 0) {
    var value = parseInt(textValue);
    if (value < 1) {
      value = 1;
    }
    document.getElementById("timeinput").value = value;
    document.getElementById("timeunit").innerHTML = value > 1 ? "days" : "day";
  }
  var oldCustom = document.getElementById("custominput").value;
  PopulateMenu();
  document.getElementById("custominput").value = oldCustom;
  CustomInputChanged();
}
function GetTimeMultiplier() {
  var textValue = document.getElementById("timeinput").value;
  if (textValue.length > 0) {
    var timeMultiplier = parseInt(textValue);
    if (timeMultiplier < 1) {
      timeMultiplier = 1;
    }
    return timeMultiplier;
  } else {
    return 1;
  }
}
function WalletListVisible(visible) {
  document.getElementById("walletlist").style.visibility = visible
    ? "visible"
    : "hidden";
}
function ShowMessage(message) {
  document.getElementById("messagecontent").innerHTML = message;
  document.getElementById("message").style.visibility = "visible";
}
function HideMessage(message) {
  document.getElementById("message").style.visibility = "hidden";
}



function CalcDecimals(quantity) {
  var dotPos = quantity.indexOf(".");
  var spacePos = quantity.indexOf(" ");
  if (dotPos != -1 && spacePos != -1) {
    return spacePos - dotPos - 1;
  }
  return 0;
}

async function GetFreeSpace() {
  for (var index = 0; index < pools.length; index++) {
    var path = "/v1/chain/get_table_rows";
    var data = JSON.stringify({
      json: true,
      code: "eosio.token",
      scope: pools[index].contract,
      table: "accounts",
      lower_bound: "WAX",
      upper_bound: "WAX",
      limit: 1,
    });
    const response = await fetch("https://" + endpoint + path, {
      headers: { "Content-Type": "text/plain" },
      body: data,
      method: "POST",
    });
    const body = await response.json();
    if (body.rows && Array.isArray(body.rows) && body.rows.length == 1) {
      pools[index].freeSpace = Math.floor(parseFloat(body.rows[0].balance));
      if (pools[index].contract == contract) {
        document.getElementById("freevalue").innerHTML =
          pools[index].name +
          ": " +
          pools[index].freeSpace +
          " WAX" +
          " available";
      }
    } else {
      ShowToast("Unexpected response retrieving balance");
    }
  }
}

function GetSymbol(quantity) {
  var spacePos = quantity.indexOf(" ");
  if (spacePos != -1) {
      return quantity.substr(spacePos + 1)
  }
  return ""
}

async function ShowToast(message) {
  var element = document.getElementById("toast");
  element.innerHTML = message;
  toastU = 0;
  var slideFrac = 0.05;
  var width = element.offsetWidth;
  var right = 16;
  var id = setInterval(frame, 1e3 / 60);
  element.style.right = -width + "px";
  element.style.visibility = "visible";
  function frame() {
    toastU += 0.005;
    if (toastU > 1) {
      clearInterval(id);
      element.style.visibility = "hidden";
    }
    p =
      toastU < slideFrac
        ? toastU / slideFrac / 2
        : 1 - toastU < slideFrac
        ? (1 - toastU) / slideFrac / 2
        : 0.5;
    element.style.right =
      (width + right) * Math.sin(p * Math.PI) - width + "px";
  }
}
async function autoLogin() {
  var isAutoLoginAvailable = await wallet_isAutoLoginAvailable();
  if (isAutoLoginAvailable) {
    login();
  }
}
async function selectWallet(walletType) {
  wallet_selectWallet(walletType);
  login();
}
async function logout() {
  wallet_logout();
  document.getElementById("loggedin").style.display = "none";
  document.getElementById("loggedout").style.display = "block";
  loggedIn = false;
  HideMessage();
}
async function login() {
  try {
    const userAccount = await wallet_login();
    ShowToast("Logged in as: " + userAccount);
    document.getElementById("accountname").innerHTML = userAccount;
    document.getElementById("loggedout").style.display = "none";
    document.getElementById("loggedin").style.display = "block";
    WalletListVisible(false);
    loggedIn = true;
 document.getElementById("controls").style.visibility="visible";
 isauth=check_auth(wallet_userAccount);

  } catch (e) {
    document.getElementById("response").innerHTML = e.message;
  }
}
const wax = new waxjs.WaxJS("https://" + endpoint, null, null, false);
const anchorTransport = new AnchorLinkBrowserTransport();
const anchorLink = new AnchorLink({
  transport: anchorTransport,
  verifyProofs: true,
  chains: [{ chainId: chainId, nodeUrl: "https://" + endpoint }],
});
async function wallet_isAutoLoginAvailable() {
  var sessionList = await anchorLink.listSessions(dapp);
  if (sessionList && sessionList.length > 0) {
    useAnchor = true;
    return true;
  } else {
    useAnchor = false;
    return await wax.isAutoLoginAvailable();
  }
}


async function wallet_selectWallet(walletType) {
  useAnchor = walletType == "anchor";
}
async function wallet_login() {
  if (useAnchor) {
    var sessionList = await anchorLink.listSessions(dapp);
    if (sessionList && sessionList.length > 0) {
      wallet_session = await anchorLink.restoreSession(dapp);
    } else {
      wallet_session = (await anchorLink.login(dapp)).session;
    }
    wallet_userAccount = String(wallet_session.auth).split("@")[0];
    auth=String(wallet_session.auth).split("@")[1];
    console.log(auth);
    anchorAuth=auth;
    //console.log(anchorAuth);    

  } else {
    wallet_userAccount = await wax.login();
    wallet_session = wax.api;
    anchorAuth="active";
  }
  return wallet_userAccount;
}
async function wallet_logout() {
  if (useAnchor) {
    await anchorLink.clearSessions(dapp);
  }
}
async function wallet_transact(actions) {
  if (useAnchor) {
    var result = await wallet_session.transact(
      { actions: actions },
      { blocksBehind: 3, expireSeconds: 30 }
    );
    result = { transaction_id: result.processed.id };
  } else {
    var result = await wallet_session.transact(
      { actions: actions },
      { blocksBehind: 3, expireSeconds: 30 }
    );
  }
  main();
  return result;
}
