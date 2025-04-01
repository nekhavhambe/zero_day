
console.log(window.session_)

function reconcileArrays(arrayOne, arrayTwo) {
    let reconciledArrayTwo = arrayTwo.map(item => ({ ...item, matched: false }));

    let unmatchedArrayOne = arrayOne.filter(item => {
        let matchIndex = reconciledArrayTwo.findIndex(
            el => el.name === item.cip_item && !el.matched
        );

        if (matchIndex !== -1) {
            reconciledArrayTwo[matchIndex].matched = true; // Mark as matched
            return false; // Exclude matched item from unmatchedArrayOne
        }

        return true; // Keep unmatched items
    });

    return { unmatchedArrayOne, reconciledArrayTwo };
}

async function getAPItem() {
    try{
    console.log(window.session_)
    const requestBody_ = `<?xml version="1.0" encoding="UTF-8"?>
    <request>
      <control>
        <senderid>null</senderid>
        <password>null</password>
        <controlid>controbdn${Date.now()}</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
      </control>
      <operation>
        <authentication>
          <sessionid>${window.session_}</sessionid>
        </authentication>
        <content>
<function controlid="controllp${Date.now()}">
<query>
<object>APADJUSTMENTITEM</object>
<select>
    <field>IS_CIP</field>
    <field>CIP_ITEM_NAME</field>
    <field>CIP_ASSET</field>
    <field>ACCOUNTNO</field>
    <field>AMOUNT</field>
    <field>CIP_GL_POSTING_DATE</field>
</select>
    <filter>
    <equalto>
        <field>IS_CIP</field>
        <value>true</value>
    </equalto>
</filter>
<pagesize>2000</pagesize>
<options> <returnformat>json</returnformat> </options>
</query>
 </function>
    <function controlid="controllp${Date.now()}">
<query>
<object>APBILLITEM</object>
<select>
    <field>IS_CIP</field>
    <field>CIP_ITEM_NAME</field>
    <field>CIP_ASSET</field>
    <field>ACCOUNTNO</field>
    <field>AMOUNT</field>
    <field>CIP_GL_POSTING_DATE</field>
</select>
    <filter>
    <equalto>
        <field>IS_CIP</field>
        <value>true</value>
    </equalto>
</filter>
<pagesize>2000</pagesize>
<options> <returnformat>json</returnformat> </options>
</query>
 </function>
         <function controlid="contrxllp${Date.now()}">
<query>
<object>cip_item</object>
<select>
    <field>Name</field>
    <field>amount</field>
    <field>cip_gl_posting_date</field>
</select>
<options> <returnformat>json</returnformat> </options>
<pagesize>2000</pagesize>
</query>
 </function>
        </content>
      </operation>
      </request>`;
    console.log(requestBody_,"100")
    const encodedRequestBody_ = encodeURIComponent(requestBody_)
    let data_budget = await fetch(`https://www-p04.intacct.com/ia/xml/ajaxgw.phtml?.sess=${window.session_}`, {
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
        },
        "body": "xmlrequest=" + encodedRequestBody_,
        "method": "POST",

    })
     console.log(data_budget,"200")
    const res = await data_budget.text()
    console.log(res,"300")
    const matches = res.match(/\[.*?\]/gs);
    if (!matches) return [];
    const parsedArrays = matches.map((segment, index) => {
        let array = JSON.parse(segment)

        if (index == 0) {
             array = array.map(el => ({ ...el, type: "Credit Memo" }))
            return array
        }

        if (index == 1) {
            array = array.map(el => ({ ...el, type: "Invoice" }))
        }

        return array
       
    });

    const res_ = [[...parsedArrays[0], ...parsedArrays[1]], parsedArrays[2]]
    const items = reconcileArrays(res_[1], res_[0])
     console.log(res_,'____|||||------', items.reconciledArrayTwo.filter(el => el.matched))
  return res_
    }catch(e){
        console.log(e,"error")
    }
}
getAPItem()
