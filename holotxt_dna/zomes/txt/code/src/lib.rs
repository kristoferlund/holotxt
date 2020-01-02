#![feature(proc_macro_hygiene)]
#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
#[macro_use]
extern crate holochain_json_derive;


use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
};

use hdk::holochain_core_types::{
    entry::Entry,
    dna::entry_types::Sharing,
    link::LinkMatch,
    time::Timeout
};
    
use hdk::holochain_json_api::{
    json::JsonString,
    error::JsonError,
};
    
use hdk::holochain_persistence_api::{
    cas::content::Address
};

use hdk_proc_macros::zome;


#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Text {
    name: String,
    contents: String,
    timestamp: u64,
    author_id: Address,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct TextLink {
    name: String,
    timestamp: u64,
    author_id: Address,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct RemoteCmd {
    cmd: String,
    text_address: Address,
    text: Text    
}

#[zome]
mod txt {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    #[entry_def]
    fn txt_entry_def() -> ValidatingEntryType {
        entry!(
            name: "text",
            description: "A text to edit collaboratively",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | validation_data: hdk::EntryValidationData<Text>| {
                match validation_data {
                    hdk::EntryValidationData::Create{ entry, .. } => {
                        const MAX_LENGTH: usize = 140;
                        if entry.contents.len() <= MAX_LENGTH {
                            Ok(())
                         } else {
                            Err("Post too long".into())
                         }
                     },
                     _ => Ok(()),
                }
            },
            links: [
                from!(
                   "%agent_id",
                   link_type: "author_text",
                   validation_package: || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: |_validation_data: hdk::LinkValidationData| {
                    Ok(())
                })
            ]
        )
    }
  

    #[zome_fn("hc_public")]
    pub fn create_text(name: String, contents: String, timestamp: u64) -> ZomeApiResult<Address> {
        let text = Text {
            name,
            contents,
            timestamp,
            author_id: hdk::AGENT_ADDRESS.clone(),
        };
        let agent_address = hdk::AGENT_ADDRESS.clone().into();
        let entry = Entry::App("text".into(), text.into());
        let address = hdk::commit_entry(&entry)?;
        hdk::link_entries(&agent_address, &address, "author_text", "")?;
        Ok(address)
    }

    #[zome_fn("hc_public")]
    pub fn save_text(text_address: Address, name: String, contents: String, timestamp: u64) -> ZomeApiResult<Address> {
        let text = Text {
            name,
            contents,
            timestamp,
            author_id: hdk::AGENT_ADDRESS.clone(),
        };
        let entry = Entry::App("text".into(), text.into());

        let updated_address = hdk::update_entry(entry, &text_address)?;
        Ok(updated_address)
    } 

    #[zome_fn("hc_public")]
    pub fn list_texts(agent_address: Address) -> ZomeApiResult<hdk::prelude::GetLinksResult> {
        hdk::api::get_links(
            &agent_address,
            LinkMatch::Exactly("author_text"),
            LinkMatch::Any,
        )
    }

    #[zome_fn("hc_public")]
    pub fn get_text(text_address: Address) -> ZomeApiResult<Text> {
        hdk::utils::get_as_type(text_address)
    }

    #[zome_fn("hc_public")]
    pub fn get_text_short(text_address: Address) -> ZomeApiResult<TextLink> {
        hdk::utils::get_as_type(text_address)
    }

    #[zome_fn("hc_public")]
    pub fn get_agent_id() -> ZomeApiResult<Address> {
        Ok(hdk::AGENT_ADDRESS.clone())
    }  

    #[zome_fn("hc_public")]
    pub fn remote_save_text(agent_address: Address, text_address: Address, name: String, contents: String, timestamp: u64) -> ZomeApiResult<String> {

        let text = Text {
            name,
            contents,
            timestamp,
            author_id: agent_address.clone()
        };

        let remote_cmd = RemoteCmd {
            cmd: "save_text".to_string(),
            text_address,
            text
        };

        let payload = serde_json::to_string(&remote_cmd).unwrap_or("error".to_string());
    
        hdk::api::send(agent_address, payload, Timeout::new(60*1000))
    } 

    #[receive]
    pub fn receive(_from: Address, _payload: String)  -> ZomeApiResult<Response>{
        let remote_cmd: serde_json::Value = match serde_json::from_str(&_payload) {
            Ok(cmd) => cmd,
            Err(_) => return "No cmd specified.".to_string(),
        };

        if remote_cmd.get("cmd").unwrap() == "save_text" {

            let _text_address = Address::from(remote_cmd["text_address"].as_str().unwrap());

            let text = Text {
                name: remote_cmd["text"]["name"].as_str().unwrap().to_string(),
                contents: remote_cmd["text"]["contents"].as_str().unwrap().to_string(),
                timestamp: u64::from_str_radix(&remote_cmd["text"]["timestamp"].to_string(), 16).unwrap(),
                author_id: hdk::AGENT_ADDRESS.clone(),
            };


            let _entry = Entry::App("text".into(), text.into());
            let _updated_address = match hdk::update_entry(_entry, &_text_address) {
                Ok(adr) => adr.to_string(),
                Err(e) => {
                    e.to_string()
                }
            };

            return _updated_address
        } else {
            return "Invalid cmd.".to_string();
        }
    }
}
