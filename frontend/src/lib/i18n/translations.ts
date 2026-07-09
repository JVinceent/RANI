export type LanguageCode = "en-US" | "fil";

export const LANGUAGES: { code: LanguageCode; name: string; region: string }[] = [
  { code: "en-US", name: "English", region: "United States" },
  { code: "fil", name: "Filipino", region: "Tagalog" },
];

// Add new keys here first, then fill in the matching translation for
// every language below. TypeScript will error if a language is missing
// a key, so it's hard to accidentally ship a half-translated screen.
export interface TranslationKeys {
  "nav.chat": string;
  "nav.contacts": string;
  "nav.history": string;
  "nav.voice": string;
  "nav.settings": string;

  "chat.greeting": string; // {name} placeholder
  "chat.subtitle": string;
  "chat.sendMoney": string;
  "chat.cashIn": string;
  "chat.checkBalance": string;
  "chat.placeholder": string;

  "settings.profile": string;
  "settings.wallet": string;
  "settings.security": string;
  "settings.notifications": string;
  "settings.language": string;
  "settings.title": string;

  "profile.displayName": string;
  "profile.email": string;
  "profile.showAddress": string;
  "profile.showAddressHint": string;
  "profile.saveChanges": string;
  "profile.saving": string;

  "language.title": string;
  "language.displayLanguage": string;

  "contacts.title": string;
  "contacts.savedOnStellar": string; // {count} placeholder
  "contacts.search": string;
  "contacts.addNew": string;
  "contacts.colContact": string;
  "contacts.colAddress": string;
  "contacts.colTag": string;
  "contacts.colLastSent": string;
  "contacts.send": string;
  "contacts.copy": string;
  "contacts.explorer": string;
  "contacts.noneFound": string;
  "contacts.tryDifferentSearch": string;

  "history.title": string;
  "history.txCountAllTime": string; // {count} placeholder
  "history.searchPlaceholder": string;
  "history.filter": string;
  "history.totalSent": string;
  "history.totalReceived": string;
  "history.net": string;
  "history.colDate": string;
  "history.colRecipient": string;
  "history.colAmount": string;
  "history.colMemo": string;
  "history.colStatus": string;
  "history.from": string;
  "history.to": string;
  "history.settled": string;

  "voice.cancel": string;
  "voice.done": string;
  "voice.listening": string;
  "voice.transcriptPlaceholder": string;

  "wallet.connectedWallets": string;
  "wallet.disconnect": string;
  "wallet.connectNew": string;

  "security.guardrails": string;
  "security.requireConfirmTitle": string;
  "security.requireConfirmDesc": string;
  "security.biometricTitle": string;
  "security.biometricDesc": string;
  "security.spendingLimits": string;
  "security.dailyLimitTitle": string;
  "security.dailyLimitDesc": string;
  "security.limitAmount": string;
  "security.perDay": string;

  "notifications.alertPreferences": string;
  "notifications.txAlertsTitle": string;
  "notifications.txAlertsDesc": string;
  "notifications.secAlertsTitle": string;
  "notifications.secAlertsDesc": string;
  "notifications.marketingTitle": string;
  "notifications.marketingDesc": string;
  "notifications.soundTitle": string;
  "notifications.soundDesc": string;

  "addContact.title": string;
  "addContact.subtitle": string;
  "addContact.nameLabel": string;
  "addContact.namePlaceholder": string;
  "addContact.addressLabel": string;
  "addContact.addressPlaceholder": string;
  "addContact.addressHint": string;
  "addContact.tagLabel": string;
  "addContact.tagPlaceholder": string;
  "addContact.cancel": string;
  "addContact.save": string;

  "confirm.title": string;
  "confirm.securedByStellar": string;
  "confirm.youSend": string;
  "confirm.recipientGets": string;
  "confirm.recipient": string;
  "confirm.networkFee": string;
  "confirm.memo": string;
  "confirm.estArrival": string;
  "confirm.estArrivalValue": string;
  "confirm.network": string;
  "confirm.warning": string;
  "confirm.confirmButton": string;
  "confirm.cancel": string;

  "historyFilter.title": string;
  "historyFilter.reset": string;
  "historyFilter.type": string;
  "historyFilter.sent": string;
  "historyFilter.received": string;
  "historyFilter.status": string;
  "historyFilter.settled": string;
  "historyFilter.pending": string;
  "historyFilter.asset": string;
  "historyFilter.xlmHint": string;
  "historyFilter.usdcHint": string;
  "historyFilter.phpcHint": string;
  "historyFilter.apply": string;

  "notifDropdown.title": string;
  "notifDropdown.markAllRead": string;
  "notifDropdown.viewAll": string;
  "notif.paymentReceivedTitle": string;
  "notif.paymentReceivedBody": string;
  "notif.securityAlertTitle": string;
  "notif.securityAlertBody": string;
  "notif.txSettledTitle": string;
  "notif.txSettledBody": string;

  "sep24.depositTitle": string;
  "sep24.anchorSubtitle": string;
  "sep24.description": string;
  "sep24.amountLabel": string;
  "sep24.minMax": string;
  "sep24.minimumError": string;
  "sep24.exchangeRate": string;
  "sep24.anchorFee": string;
  "sep24.estArrival": string;
  "sep24.estArrivalValue": string;
  "sep24.authorizeButton": string;
  "sep24.encryptedNote": string;
  "sep24.connecting": string;
  "sep24.completeInApp": string;
  "sep24.doNotClose": string;
  "sep24.stepAwaiting": string;
  "sep24.depositInitiated": string;
  "sep24.arrivesInSuffix": string; // shown after "≈ {amount} USDC · "
  "sep24.method": string;
  "sep24.phpSent": string;
  "sep24.usdcReceived": string;
  "sep24.fee": string;
  "sep24.status": string;
  "sep24.processingStatus": string;
  "sep24.returnToRani": string;
}

export const translations: Record<LanguageCode, TranslationKeys> = {
  "en-US": {
    "nav.chat": "Chat",
    "nav.contacts": "Contacts",
    "nav.history": "History",
    "nav.voice": "Voice",
    "nav.settings": "Settings",

    "chat.greeting": "Hey, {name} 👋",
    "chat.subtitle": "Type a payment in plain language to get started.",
    "chat.sendMoney": "Send Money",
    "chat.cashIn": "Cash In (GCash)",
    "chat.checkBalance": "Check Balance",
    "chat.placeholder": 'Try "Send ₱200 to Juan" or ask Rani anything...',

    "settings.profile": "Profile",
    "settings.wallet": "Wallet",
    "settings.security": "Security",
    "settings.notifications": "Notifications",
    "settings.language": "Language",
    "settings.title": "Settings",

    "profile.displayName": "Display Name",
    "profile.email": "Email",
    "profile.showAddress": "Show public address to contacts",
    "profile.showAddressHint": "Let contacts see your Stellar address when they search your name.",
    "profile.saveChanges": "Save changes",
    "profile.saving": "Saving…",

    "language.title": "Language",
    "language.displayLanguage": "Display Language",

    "contacts.title": "Contacts",
    "contacts.savedOnStellar": "{count} saved on Stellar",
    "contacts.search": "Search contacts…",
    "contacts.addNew": "Add New Contact",
    "contacts.colContact": "Contact",
    "contacts.colAddress": "Stellar Address",
    "contacts.colTag": "Tag",
    "contacts.colLastSent": "Last Sent",
    "contacts.send": "Send",
    "contacts.copy": "Copy",
    "contacts.explorer": "Explorer",
    "contacts.noneFound": "No contacts found",
    "contacts.tryDifferentSearch": "Try a different search term.",

    "history.title": "Transaction History",
    "history.txCountAllTime": "{count} transactions · All time",
    "history.searchPlaceholder": "Search transactions…",
    "history.filter": "Filter",
    "history.totalSent": "Total Sent",
    "history.totalReceived": "Total Received",
    "history.net": "Net",
    "history.colDate": "Date",
    "history.colRecipient": "Recipient",
    "history.colAmount": "Amount",
    "history.colMemo": "Memo",
    "history.colStatus": "Status",
    "history.from": "from",
    "history.to": "to",
    "history.settled": "Settled",

    "voice.listening": "Listening",
    "voice.cancel": "Cancel",
    "voice.done": "Done",
    "voice.transcriptPlaceholder": '"Send 500 pesos to...',

    "wallet.connectedWallets": "Connected Wallets",
    "wallet.disconnect": "Disconnect",
    "wallet.connectNew": "Connect new wallet",

    "security.guardrails": "Transaction Guardrails",
    "security.requireConfirmTitle": "Require confirmation before sending",
    "security.requireConfirmDesc": "Every payment will display a review step before processing.",
    "security.biometricTitle": "Biometric authentication",
    "security.biometricDesc": "Use Face ID or fingerprint to authorize each payment.",
    "security.spendingLimits": "Spending Limits",
    "security.dailyLimitTitle": "Daily Spending Limit",
    "security.dailyLimitDesc": "Block transactions that would exceed your configured daily threshold.",
    "security.limitAmount": "Limit Amount",
    "security.perDay": "PHP / day",

    "notifications.alertPreferences": "Alert Preferences",
    "notifications.txAlertsTitle": "Transaction alerts",
    "notifications.txAlertsDesc": "Receive a notification for every send and receive.",
    "notifications.secAlertsTitle": "Security alerts",
    "notifications.secAlertsDesc": "Get notified when a new device signs in or something looks unusual.",
    "notifications.marketingTitle": "Marketing updates",
    "notifications.marketingDesc": "Product news, tips, and feature announcements.",
    "notifications.soundTitle": "Notification sounds",
    "notifications.soundDesc": "Play a sound when you receive a transaction or alert.",

    "addContact.title": "Add New Contact",
    "addContact.subtitle": "Saved to your local address book",
    "addContact.nameLabel": "Contact Name or Nickname",
    "addContact.namePlaceholder": "e.g. Juan Reyes",
    "addContact.addressLabel": "Stellar Address",
    "addContact.addressPlaceholder": "Starts with G...",
    "addContact.addressHint": "Address must start with G",
    "addContact.tagLabel": "Tag / Group (Optional)",
    "addContact.tagPlaceholder": "e.g. Family, Work, Landlord",
    "addContact.cancel": "Cancel",
    "addContact.save": "Save Contact",

    "confirm.title": "Confirm Payment",
    "confirm.securedByStellar": "Secured by Stellar",
    "confirm.youSend": "You Send",
    "confirm.recipientGets": "Recipient Gets",
    "confirm.recipient": "Recipient",
    "confirm.networkFee": "Network Fee",
    "confirm.memo": "Memo",
    "confirm.estArrival": "Est. Arrival",
    "confirm.estArrivalValue": "< 5 seconds",
    "confirm.network": "Stellar network",
    "confirm.warning": "This transaction is irreversible. Please verify the recipient before confirming.",
    "confirm.confirmButton": "Confirm Payment",
    "confirm.cancel": "Cancel",

    "historyFilter.title": "Filters",
    "historyFilter.reset": "Reset",
    "historyFilter.type": "Type",
    "historyFilter.sent": "Sent",
    "historyFilter.received": "Received",
    "historyFilter.status": "Status",
    "historyFilter.settled": "Settled",
    "historyFilter.pending": "Pending",
    "historyFilter.asset": "Asset",
    "historyFilter.xlmHint": "Stellar Lumens",
    "historyFilter.usdcHint": "USD Coin",
    "historyFilter.phpcHint": "Philippine Coin",
    "historyFilter.apply": "Apply Filters",

    "notifDropdown.title": "Notifications",
    "notifDropdown.markAllRead": "Mark all as read",
    "notifDropdown.viewAll": "View all notifications",
    "notif.paymentReceivedTitle": "Payment Received",
    "notif.paymentReceivedBody": "Received ₱500 from Juan Reyes",
    "notif.securityAlertTitle": "Security Alert",
    "notif.securityAlertBody": "Security: New device signed in.",
    "notif.txSettledTitle": "Transaction Settled",
    "notif.txSettledBody": "Transaction settled in 4.2s.",

    "sep24.depositTitle": "Deposit via GCash",
    "sep24.anchorSubtitle": "Stellar Anchor (SEP-24)",
    "sep24.description": "Funds deposited via GCash will be converted to USDC and credited to your Stellar wallet instantly.",
    "sep24.amountLabel": "Amount in PHP",
    "sep24.minMax": "Min: ₱100 · Max: ₱50,000",
    "sep24.minimumError": "Minimum ₱100",
    "sep24.exchangeRate": "Exchange Rate",
    "sep24.anchorFee": "Anchor Fee",
    "sep24.estArrival": "Est. Arrival",
    "sep24.estArrivalValue": "~2 minutes",
    "sep24.authorizeButton": "Authorize GCash Deposit",
    "sep24.encryptedNote": "256-bit encrypted · Stellar SEP-24 compliant",
    "sep24.connecting": "Connecting to GCash...",
    "sep24.completeInApp": "Please complete the payment in your GCash app.",
    "sep24.doNotClose": "Do not close this window.",
    "sep24.stepAwaiting": "Step 2 of 3 — Awaiting GCash authorization",
    "sep24.depositInitiated": "Deposit Initiated!",
    "sep24.arrivesInSuffix": "arrives in ~2 minutes",
    "sep24.method": "Method",
    "sep24.phpSent": "PHP Sent",
    "sep24.usdcReceived": "USDC Received",
    "sep24.fee": "Fee",
    "sep24.status": "Status",
    "sep24.processingStatus": "Processing ✓",
    "sep24.returnToRani": "Return to Rani",
  },
  fil: {
    "nav.chat": "Chat",
    "nav.contacts": "Mga Kontak",
    "nav.history": "Kasaysayan",
    "nav.voice": "Boses",
    "nav.settings": "Mga Setting",

    "chat.greeting": "Kumusta, {name} 👋",
    "chat.subtitle": "I-type ang pagbabayad sa simpleng salita para magsimula.",
    "chat.sendMoney": "Magpadala ng Pera",
    "chat.cashIn": "Mag-cash In (GCash)",
    "chat.checkBalance": "Tingnan ang Balanse",
    "chat.placeholder": 'Subukan ang "Magpadala ng ₱200 kay Juan" o kahit ano, itanong kay Rani...',

    "settings.profile": "Profile",
    "settings.wallet": "Wallet",
    "settings.security": "Seguridad",
    "settings.notifications": "Mga Abiso",
    "settings.language": "Wika",
    "settings.title": "Mga Setting",

    "profile.displayName": "Ipapakitang Pangalan",
    "profile.email": "Email",
    "profile.showAddress": "Ipakita ang public address sa mga kontak",
    "profile.showAddressHint": "Hayaang makita ng mga kontak ang iyong Stellar address kapag hinanap nila ang iyong pangalan.",
    "profile.saveChanges": "I-save ang mga pagbabago",
    "profile.saving": "Sine-save…",

    "language.title": "Wika",
    "language.displayLanguage": "Ipapakitang Wika",

    "contacts.title": "Mga Kontak",
    "contacts.savedOnStellar": "{count} naka-save sa Stellar",
    "contacts.search": "Maghanap ng kontak…",
    "contacts.addNew": "Magdagdag ng Bagong Kontak",
    "contacts.colContact": "Kontak",
    "contacts.colAddress": "Stellar Address",
    "contacts.colTag": "Tanda",
    "contacts.colLastSent": "Huling Padala",
    "contacts.send": "Magpadala",
    "contacts.copy": "Kopyahin",
    "contacts.explorer": "Explorer",
    "contacts.noneFound": "Walang nahanap na kontak",
    "contacts.tryDifferentSearch": "Subukan ang ibang search term.",

    "history.title": "Kasaysayan ng Transaksyon",
    "history.txCountAllTime": "{count} transaksyon · Lahat ng oras",
    "history.searchPlaceholder": "Maghanap ng transaksyon…",
    "history.filter": "Filter",
    "history.totalSent": "Kabuuang Naipadala",
    "history.totalReceived": "Kabuuang Natanggap",
    "history.net": "Net",
    "history.colDate": "Petsa",
    "history.colRecipient": "Tatanggap",
    "history.colAmount": "Halaga",
    "history.colMemo": "Memo",
    "history.colStatus": "Katayuan",
    "history.from": "mula kay",
    "history.to": "kay",
    "history.settled": "Nasettle na",

    "voice.listening": "Nakikinig",
    "voice.cancel": "Kanselahin",
    "voice.done": "Tapos na",
    "voice.transcriptPlaceholder": '"Magpadala ng 500 pesos kay...',

    "wallet.connectedWallets": "Mga Nakakonektang Wallet",
    "wallet.disconnect": "Idiskonekta",
    "wallet.connectNew": "Kumonekta ng bagong wallet",

    "security.guardrails": "Mga Guardrail ng Transaksyon",
    "security.requireConfirmTitle": "Kumpirmahin muna bago magpadala",
    "security.requireConfirmDesc": "Ang bawat pagbabayad ay magpapakita ng review step bago ito iproseso.",
    "security.biometricTitle": "Biometric authentication",
    "security.biometricDesc": "Gamitin ang Face ID o fingerprint para pahintulutan ang bawat pagbabayad.",
    "security.spendingLimits": "Mga Limitasyon sa Paggastos",
    "security.dailyLimitTitle": "Pang-araw-araw na Limitasyon sa Paggastos",
    "security.dailyLimitDesc": "Harangin ang mga transaksyong lalampas sa iyong itinakdang pang-araw-araw na limitasyon.",
    "security.limitAmount": "Halaga ng Limitasyon",
    "security.perDay": "PHP / araw",

    "notifications.alertPreferences": "Mga Kagustuhan sa Abiso",
    "notifications.txAlertsTitle": "Mga abiso sa transaksyon",
    "notifications.txAlertsDesc": "Tumanggap ng abiso sa bawat pagpadala at pagtanggap.",
    "notifications.secAlertsTitle": "Mga abiso sa seguridad",
    "notifications.secAlertsDesc": "Maabisuhan kapag may bagong device na naka-sign in o may kakaibang nangyayari.",
    "notifications.marketingTitle": "Mga update sa marketing",
    "notifications.marketingDesc": "Balita tungkol sa produkto, mga tip, at anunsyo ng bagong feature.",
    "notifications.soundTitle": "Tunog ng abiso",
    "notifications.soundDesc": "Magpatugtog ng tunog kapag may natanggap kang transaksyon o abiso.",

    "addContact.title": "Magdagdag ng Bagong Kontak",
    "addContact.subtitle": "Naka-save sa iyong lokal na address book",
    "addContact.nameLabel": "Pangalan o Palayaw ng Kontak",
    "addContact.namePlaceholder": "hal. Juan Reyes",
    "addContact.addressLabel": "Stellar Address",
    "addContact.addressPlaceholder": "Nagsisimula sa G...",
    "addContact.addressHint": "Ang address ay dapat magsimula sa G",
    "addContact.tagLabel": "Tag / Grupo (Opsyonal)",
    "addContact.tagPlaceholder": "hal. Pamilya, Trabaho, Kasera",
    "addContact.cancel": "Kanselahin",
    "addContact.save": "I-save ang Kontak",

    "confirm.title": "Kumpirmahin ang Bayad",
    "confirm.securedByStellar": "Pinoprotektahan ng Stellar",
    "confirm.youSend": "Ipapadala Mo",
    "confirm.recipientGets": "Matatanggap ng Tatanggap",
    "confirm.recipient": "Tatanggap",
    "confirm.networkFee": "Bayad sa Network",
    "confirm.memo": "Memo",
    "confirm.estArrival": "Tinatayang Dating",
    "confirm.estArrivalValue": "< 5 segundo",
    "confirm.network": "Stellar network",
    "confirm.warning": "Hindi na maibabalik ang transaksyong ito. Pakitiyak ang tatanggap bago kumpirmahin.",
    "confirm.confirmButton": "Kumpirmahin ang Bayad",
    "confirm.cancel": "Kanselahin",

    "historyFilter.title": "Mga Filter",
    "historyFilter.reset": "I-reset",
    "historyFilter.type": "Uri",
    "historyFilter.sent": "Naipadala",
    "historyFilter.received": "Natanggap",
    "historyFilter.status": "Katayuan",
    "historyFilter.settled": "Nasettle na",
    "historyFilter.pending": "Nakabinbin",
    "historyFilter.asset": "Asset",
    "historyFilter.xlmHint": "Stellar Lumens",
    "historyFilter.usdcHint": "USD Coin",
    "historyFilter.phpcHint": "Philippine Coin",
    "historyFilter.apply": "Ilapat ang mga Filter",

    "notifDropdown.title": "Mga Abiso",
    "notifDropdown.markAllRead": "Markahan lahat bilang nabasa",
    "notifDropdown.viewAll": "Tingnan lahat ng abiso",
    "notif.paymentReceivedTitle": "Natanggap na Bayad",
    "notif.paymentReceivedBody": "Nakatanggap ng ₱500 mula kay Juan Reyes",
    "notif.securityAlertTitle": "Abiso sa Seguridad",
    "notif.securityAlertBody": "Seguridad: May bagong device na nag-sign in.",
    "notif.txSettledTitle": "Nasettle na ang Transaksyon",
    "notif.txSettledBody": "Nasettle ang transaksyon sa loob ng 4.2s.",

    "sep24.depositTitle": "Mag-deposit gamit ang GCash",
    "sep24.anchorSubtitle": "Stellar Anchor (SEP-24)",
    "sep24.description": "Ang mga pondong idineposito gamit ang GCash ay ico-convert sa USDC at ikre-credit agad sa iyong Stellar wallet.",
    "sep24.amountLabel": "Halaga sa PHP",
    "sep24.minMax": "Min: ₱100 · Max: ₱50,000",
    "sep24.minimumError": "Minimum na ₱100",
    "sep24.exchangeRate": "Palitan ng Halaga",
    "sep24.anchorFee": "Bayad sa Anchor",
    "sep24.estArrival": "Tinatayang Dating",
    "sep24.estArrivalValue": "~2 minuto",
    "sep24.authorizeButton": "Payagan ang GCash Deposit",
    "sep24.encryptedNote": "256-bit na naka-encrypt · Sumusunod sa Stellar SEP-24",
    "sep24.connecting": "Kumokonekta sa GCash...",
    "sep24.completeInApp": "Pakikumpleto ang pagbabayad sa iyong GCash app.",
    "sep24.doNotClose": "Huwag isara ang window na ito.",
    "sep24.stepAwaiting": "Hakbang 2 ng 3 — Hinihintay ang pahintulot sa GCash",
    "sep24.depositInitiated": "Nasimulan na ang Deposit!",
    "sep24.arrivesInSuffix": "darating sa loob ng ~2 minuto",
    "sep24.method": "Paraan",
    "sep24.phpSent": "Naipadalang PHP",
    "sep24.usdcReceived": "Natanggap na USDC",
    "sep24.fee": "Bayad",
    "sep24.status": "Katayuan",
    "sep24.processingStatus": "Pinoproseso ✓",
    "sep24.returnToRani": "Bumalik sa Rani",
  },
};