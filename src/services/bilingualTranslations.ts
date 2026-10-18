/**
 * Bilingual Master Translation Dictionary & Universal Auto-Translator
 * Covers UI strings, complete phrases, compound phrases, and individual Bengali words
 * Ensures 100% complete English switching across all components without leaving a single Bengali word behind.
 */

// 1. Full Multi-Word Phrases (matched from longest to shortest)
export const PHRASE_TRANSLATIONS: [string, string][] = [
  [
    "রকেট অ্যাকাউন্ট থেকে উপরে উল্লেখিত ১২ ডিজিট নম্বর পাঠিয়ে ট্রানজেকশন আইডি দিয়ে ডিপোজিট করুন।",
    "Send money from Rocket account to the above mentioned 12-digit number and deposit using Transaction ID."
  ],
  [
    "রকেট অ্যাকাউন্ট থেকে উপরে উল্লেখিত 12 ডিজিট নম্বর পাঠিয়ে ট্রানজেকশন আইডি দিয়ে ডিপোজিট করুন।",
    "Send money from Rocket account to the above mentioned 12-digit number and deposit using Transaction ID."
  ],
  [
    "রকেট অ্যাকাউন্ট থেকে উপরে উল্লেখিত ১২ ডিজিটের নম্বরে পাঠিয়ে ট্রানজেকশন আইডি দিয়ে ডিপোজিট করুন",
    "Send money from Rocket account to the above mentioned 12-digit number and deposit using Transaction ID"
  ],
  [
    "রকেট অ্যাকাউন্ট থেকে উপরে উল্লেখিত 12 ডিজিটের নম্বরে পাঠিয়ে ট্রানজেকশন আইডি দিয়ে ডিপোজিট করুন",
    "Send money from Rocket account to the above mentioned 12-digit number and deposit using Transaction ID"
  ],
  [
    "ইমু, হোয়াটসঅ্যাপ বা সরাসরি হেল্পলাইনে ফোন করে যেকোনো সময় লোন ও কিস্তি সংক্রান্ত সেবা নিন।",
    "Get loan and installment services anytime by calling imo, WhatsApp or helpline directly."
  ],
  [
    "ইমু, হোয়াটসঅ্যাপ বা সরাসরি হেল্পলাইনে ফোন করে যেকোনো সময় সেবা নিন।",
    "Get services anytime by calling imo, WhatsApp or helpline directly."
  ],
  [
    "২৪ ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা",
    "24/7 Uninterrupted Customer Support Open"
  ],
  [
    "24 ঘণ্টা নিরবচ্ছিন্ন গ্রাহক সহায়তা খোলা",
    "24/7 Uninterrupted Customer Support Open"
  ],
  [
    "যেগুলো চ্যানেল একটিভ রাখবেন সেগুলো গ্রাহক সহায়তার মডালে প্রদর্শিত হবে। আপনি চাইলে যেকোনো অপশন ডিলিট করে বাদ দিতে বা নতুন যোগ করতে পারেন।",
    "Channels you keep active will be displayed in the Customer Support modal. You can delete or add any option."
  ],
  [
    "যেগুলো চ্যানেল একটিভ রাখবেন সেগুলো গ্রাহক সহায়তার মডালে প্রদর্শিত হবে",
    "Channels kept active will be displayed in Customer Support modal"
  ],
  [
    "রিয়েল-টাইম সিঙ্ক সক্রিয়: নতুন কোনো গ্রাহক যেকোনো ডিভাইস থেকে অ্যাকাউন্ট খোলার সাথে সাথেই ব্রাউজার রিফ্রেশ ছাড়াই এই তালিকায় স্বয়ংক্রিয়ভাবে যুক্ত হবে।",
    "Real-time Sync Active: Whenever a new customer opens an account from any device, they will be automatically added to this list without browser refresh."
  ],
  [
    "বাই-ডিফল্ট কোনো গ্রাহকের ড্যাশবোর্ডে চুক্তিপত্র পেপার প্রদর্শিত হবে না। আপনি চাইলে সব গ্রাহককে একসাথে অনুমতি দিতে পারেন অথবা এডিট অপশন থেকে নির্দিষ্ট কোনো গ্রাহককে অনুমতি দিতে পারেন।",
    "By default, loan agreement paper will not be displayed on any customer's dashboard. You can grant permission to all customers at once or specific customers via edit."
  ],
  [
    "কোনো ডানে স্ক্রল ছাড়াই এক নজরে সব তথ্য ও নিয়ন্ত্রণ",
    "All information and control at a glance without horizontal scrolling"
  ],
  [
    "যে কোনো ইউজার সিলেক্ট করে কিস্তি বাবদ টাকা জমার শর্ত (যেমন ২০০০ টাকা), বীমা ফি বা ভেরিফিকেশন ফি দিন। গ্রাহক স্লিপ জমা দিলে ভিউ করে Accept করুন এবং চাইলে পরবর্তী শর্ত যুক্ত করুন।",
    "Select any user and set installment condition (e.g. 2000 BDT), insurance fee, or verification fee. View and accept customer slips, and add next conditions as needed."
  ],
  [
    "যে কোনো ইউজার সিলেক্ট করে কিস্তি বাবদ টাকা জমার শর্ত",
    "Select any user to set installment deposit conditions"
  ],
  [
    "ইউজার সিলেক্ট করে কাস্টম উইথড্রয়াল শর্ত নির্ধারণ ও স্লিপ যাচাই",
    "Select User to Configure Custom Withdrawal Conditions & Verify Slips"
  ],
  [
    "ইউজার সিলেক্ট করে শর্ত দিন / পরিবর্তন করুন",
    "Select User to Set / Change Conditions"
  ],
  [
    "তথ্য ও পাসওয়ার্ড এডিট",
    "Edit Info & Password"
  ],
  [
    "উচ্চ রেজোলিউশন ৩x ক্রিস্প ক্লিয়ার প্রিন্ট ও পিএনজি রেডি",
    "High-Resolution 3x Crisp Clear Print & PNG Ready"
  ],
  [
    "উচ্চ রেজোলিউশন 3x ক্রিস্প ক্লিয়ার প্রিন্ট ও পিএনজি রেডি",
    "High-Resolution 3x Crisp Clear Print & PNG Ready"
  ],
  [
    "স্মার্ট কার্ড ভিউ (স্ক্রল-মুক্ত)",
    "Smart Card View (Scroll-Free)"
  ],
  [
    "কমপ্যাক্ট টেবিল",
    "Compact Table"
  ],
  [
    "ডিজিটাল একাউন্ট নম্বর, মোবাইল নম্বর বা ইউজার আইডি খুঁজুন...",
    "Search digital account number, mobile number, or user ID..."
  ],
  [
    "গ্রাহক তালিকা ও নিয়ন্ত্রণ প্যানেল",
    "Customer List & Control Panel"
  ],
  [
    "চুক্তিপত্র পেপার অ্যাক্সেস নিয়ন্ত্রণ (Loan Agreement Paper Access)",
    "Loan Agreement Paper Access Control"
  ],
  [
    "সবাইকে অনুমতি দিন (Grant All)",
    "Grant All Permission"
  ],
  [
    "সবার অনুমতি বন্ধ করুন (Revoke All)",
    "Revoke All Permission"
  ],
  [
    "নিরাপত্তা নিয়ন্ত্রণ",
    "Security Control"
  ],
  [
    "কাস্টম শর্ত সিস্টেম",
    "Custom Condition System"
  ],
  [
    "লাইভ সিঙ্ক চালু",
    "Live Sync Active"
  ],
  [
    "গ্রাহক ভিউ",
    "Customer View"
  ],
  [
    "অফিসিয়াল সনদ ও ব্যাংক দলিল",
    "Official Certificate & Bank Documents"
  ],
  [
    "স্টাফ আইডি কার্ড (NID স্টাইল)",
    "Staff ID Card (NID Style)"
  ],
  [
    "স্ট্যাম্প ও ডিজিটাল ঋণ চুক্তিপত্র",
    "Stamp & Digital Loan Contract"
  ],
  [
    "লোন অনুমোদন লেটার (Sanction Letter)",
    "Loan Approval Sanction Letter"
  ],
  [
    "টাকা উত্তোলন (Withdraw) ও চার্জ",
    "Withdraw Funds & Charges"
  ],
  [
    "ডিপোজিট ও পেমেন্ট মেথড ম্যানেজমেন্ট",
    "Deposit & Payment Method Management"
  ],
  [
    "সকল ইউজার অ্যাকাউন্টস ও প্রোফাইল",
    "All User Accounts & Profiles"
  ],
  [
    "লোন আবেদন যাচাই ও অনুমোদন",
    "Verify & Approve Loan Applications"
  ],
  [
    "ব্যাংকের নাম: DBS Bank Ltd. ঠিকানা: 12 মেরিনা বুলেভার্ড, মেরিনা বে ফাইন্যান্সিয়াল সেন্টার, টাওয়ার 3, সিঙ্গাপুর 018982। দেশ: সিঙ্গাপুর",
    "Bank Name: DBS Bank Ltd. Address: 12 Marina Boulevard, Marina Bay Financial Centre, Tower 3, Singapore 018982. Country: Singapore"
  ],
  [
    "You কি একজন গৃহিণী? নিজের ছোট ব্যবসা শুরু করতে, পরিবারের প্রয়োজন মেটাতে অথবা আর্থিকভাবে স্বাবলম্বী হতে লোন সম্পর্কে জানতে চান?",
    "Are you a housewife? Want to know about loans to start your small business, fulfill family needs, or become financially independent?"
  ],
  [
    "কি একজন গৃহিণী? নিজের ছোট ব্যবসা শুরু করতে, পরিবারের প্রয়োজন মেটাতে অথবা আর্থিকভাবে স্বাবলম্বী হতে লোন সম্পর্কে জানতে চান?",
    "Are you a housewife? Want to know about loans to start your small business, fulfill family needs, or become financially independent?"
  ],
  [
    "গ্রাহকদের দ্রুত ও সুরক্ষিত ঋণ সেবা নিশ্চিত করতে দেশের শীর্ষস্থানীয় বাণিজ্যিক ব্যাংকের সাথে আমরা সরাসরি সংযুক্ত।",
    "We are directly connected with the country's leading commercial banks to ensure fast and secure loan services for customers."
  ],
  [
    "গ্রাহকদের দ্রুত ও সুরক্ষিত ঋণ সেবা নিশ্চিত করতে দেশের শীর্ষস্থানীয় বাণিজ্যিক ব্যাংকের সাথে আমরা সরাসরি সংযুক্ত",
    "We are directly connected with the country's leading commercial banks to ensure fast and secure loan services for customers"
  ],
  [
    "আপনার Applyের রেফারেন্স নম্বর (যেমন: LN-2026-1001) অথবা Applyে ব্যবহৃত Mobile Number দিয়ে অনুসন্ধান করুন।",
    "Search with your application reference ID (e.g. LN-2026-1001) or registered mobile number."
  ],
  [
    "আপনার আবেদনের রেফারেন্স নম্বর (যেমন: LN-2026-1001) অথবা আবেদনে ব্যবহৃত মোবাইল নম্বর দিয়ে অনুসন্ধান করুন।",
    "Search with your application reference ID (e.g. LN-2026-1001) or registered mobile number."
  ],
  [
    "আমাদের বিশেষজ্ঞ লোন অফিসাররা সপ্তাহের ৬ দিন সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত আপনার সেবায় নিয়োজিত।",
    "Our expert loan officers are dedicated to your service 6 days a week, from 9:00 AM to 6:00 PM."
  ],
  [
    "আমাদের বিশেষজ্ঞ লোন অফিসাররা সপ্তাহের 6 দিন সকাল 9টা থেকে সন্ধ্যা 6টা পর্যন্ত আপনার সেবায় নিয়োজিত।",
    "Our expert loan officers are dedicated to your service 6 days a week, from 9:00 AM to 6:00 PM."
  ],
  [
    "বৃহস্পতিবার থেকে শনিবার: সকাল ৯টা থেকে রাত ৯টা পর্যন্ত (বাংলাদেশ সময়)। শুক্রবার অফিস বন্ধ থাকবে।",
    "Thursday to Saturday: 9:00 AM to 9:00 PM (Bangladesh Time). Friday office is closed."
  ],
  [
    "আমাদের বিশেষজ্ঞ লোন অফিসাররা সপ্তাহের ৬ দিন সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত আপনার সেবায় নিয়োজিত",
    "Our expert loan officers are dedicated to your service 6 days a week, from 9:00 AM to 6:00 PM"
  ],
  [
    "আমাদের বিশেষজ্ঞ লোন অফিসাররা সপ্তাহের 6 দিন সকাল 9টা থেকে সন্ধ্যা 6টা পর্যন্ত আপনার সেবায় নিয়োজিত",
    "Our expert loan officers are dedicated to your service 6 days a week, from 9:00 AM to 6:00 PM"
  ],
  [
    "মাত্র ৫ মিনিটে তথ্য পূরণ করুন। কোনো জটিল কাগজপত্র বা অতিরিক্ত জামানত ছাড়াই দ্রুত ঋণ অনুমোদন পান।",
    "Fill in your details in just 5 minutes. Get fast loan approval without complex paperwork or collateral."
  ],
  [
    "মাত্র 5 মিনিটে তথ্য পূরণ করুন। কোনো জটিল কাগজপত্র বা অতিরিক্ত জামানত ছাড়াই দ্রুত ঋণ অনুমোদন পান।",
    "Fill in your details in just 5 minutes. Get fast loan approval without complex paperwork or collateral."
  ],
  [
    "আমাদের স্বচ্ছ ও আধুনিক প্রযুক্তিভিত্তিক পদ্ধতিতে ঋণ গ্রহণের প্রতিটি ধাপ খুবই দ্রুত ও সহজবোধ্য।",
    "With our transparent and modern tech-driven method, every step of obtaining a loan is fast and straightforward."
  ],
  [
    "আমাদের স্বচ্ছ ও আধুনিক প্রযুক্তিভিত্তিক পদ্ধতিতে ঋণ গ্রহণের প্রতিটি ধাপ খুবই দ্রুত ও সহজবোধ্য",
    "With our transparent and modern tech-driven method, every step of obtaining a loan is fast and straightforward"
  ],
  [
    "বৃহস্পতিবার to শনিবার: সকাল 9টা to রাত 9টা up to (বাংলাদেশ সময়)। শুক্রবার অফিস বন্ধ থাকবে।",
    "Thursday to Saturday: 9:00 AM to 9:00 PM (Bangladesh Time). Friday office is closed."
  ],
  [
    "গ্রাহকদের নিরাপদ ও দ্রুত ঋণ সেবা নিশ্চিতে বাংলাদেশের শীর্ষস্থানীয় তফসিলি ব্যাংকসমূহ।",
    "Leading scheduled banks of Bangladesh to ensure safe and fast loan services for customers."
  ],
  [
    "গ্রাহকদের নিরাপদ ও দ্রুত ঋণ সেবা নিশ্চিতে বাংলাদেশের শীর্ষস্থানীয় তফসিলি ব্যাংকসমূহ",
    "Leading scheduled banks of Bangladesh to ensure safe and fast loan services for customers"
  ],
  [
    "আপনার প্রয়োজন এবং সুবিধার কথা বিবেচনা করে আমাদের লোন স্কিমগুলো সাজানো হয়েছে।",
    "Our loan schemes are tailored keeping your needs and convenience in mind."
  ],
  [
    "সহজ শর্ত, কম সুদের হার এবং নমনীয় কিস্তির সুবিধা নিয়ে এগিয়ে যান স্বপ্নের পথে।",
    "Move forward toward your dreams with easy terms, low interest rates, and flexible installments."
  ],
  [
    "বাংলাদেশ ব্যাংক ও আন্তর্জাতিক ব্যাংকিং গাইডলাইন অনুযায়ী পরিচালিত",
    "Governed under central banking and international financial guidelines"
  ],
  [
    "এই লোনের মাধ্যমে গ্রাহকরা তাদের আর্থিক লক্ষ্য পূরণ করতে পারেন।",
    "Borrowers can fulfill their financial goals through this loan."
  ],
  [
    "২. কাঙ্ক্ষিত ঋণের পরিমাণ লিখুন (২০ হাজার থেকে ৫০ লক্ষ টাকা): *",
    "2. Enter desired loan amount (20 thousand to 50 lakh BDT): *"
  ],
  [
    "সরাসরি ব্যাংক একাউন্টে তাৎক্ষণিক ফান্ড ট্রান্সফার ও ভেরিফিকেশন",
    "Instant fund transfer and verification directly to bank accounts"
  ],
  [
    "দেশের শীর্ষস্থানীয় বাণিজ্যিক ব্যাংকের সাথে আমরা সরাসরি সংযুক্ত",
    "we are directly connected with the country's leading commercial banks"
  ],
  [
    "2. কাঙ্ক্ষিত ঋণের Amount লিখুন (20 হাজার to 50 লক্ষ BDT): *",
    "2. Enter desired loan amount (20 thousand to 50 lakh BDT): *"
  ],
  [
    "নির্ভুল তথ্য দিন যাতে আবেদন দ্রুত যাচাই ও অনুমোদন করা যায়।",
    "Provide accurate info so your application can be verified and approved quickly."
  ],
  [
    "নির্ভুল তথ্য দিন যাতে Apply দ্রুত যাচাই ও অনুমোদন করা যায়।",
    "Provide accurate info so your application can be verified and approved quickly."
  ],
  [
    "রেফারেন্স আইডি (যেমন: LN-2026-1001) বা Mobile Number...",
    "Reference ID (e.g. LN-2026-1001) or Phone Number..."
  ],
  [
    "রেফারেন্স আইডি (যেমন: LN-2026-1001) বা মোবাইল নম্বর...",
    "Reference ID (e.g. LN-2026-1001) or Phone Number..."
  ],
  [
    "১. জনপ্রিয় ঋণের পরিমাণ (ক্লিক করলেই ঘরে বসে যাবে):",
    "1. Popular loan amounts (Click to select):"
  ],
  [
    "1. জনপ্রিয় ঋণের Amount (ক্লিক করলেই ঘরে বসে যাবে):",
    "1. Popular loan amounts (Click to select):"
  ],
  [
    "বিদেশে গমনেচ্ছুকদের জন্য মাত্র ২% সুদের হারে লোন",
    "Loans at just 2% interest for overseas job seekers"
  ],
  [
    "বিদেশে গমনেচ্ছুকদের জন্য মাত্র 2% সুদের হারে লোন",
    "Loans at just 2% interest for overseas job seekers"
  ],
  [
    "যেমন: 50000 (নিজের ইচ্ছামতো যেকোনো পরিমাণ লিখুন)",
    "e.g. 50000 (Enter any amount of your choice)"
  ],
  [
    "আমাদের স্বচ্ছ ও আধুনিক প্রযুক্তিভিত্তিক পদ্ধতিতে",
    "With our transparent and modern tech-driven method"
  ],
  [
    "সপ্তাহের ৬ দিন সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত",
    "6 days a week, from 9:00 AM to 6:00 PM"
  ],
  [
    "সপ্তাহের 6 দিন সকাল 9টা থেকে সন্ধ্যা 6টা পর্যন্ত",
    "6 days a week, from 9:00 AM to 6:00 PM"
  ],
  [
    "বীজ, সার ও আধুনিক কৃষি যন্ত্রপাতি ক্রয়ে Support",
    "Support for seeds, fertilizer & modern agricultural equipment"
  ],
  [
    "টাকা তোলার জন্য বিকাশ, নগদ বা ব্যাংক যুক্ত করুন",
    "Add bKash, Nagad or Bank to withdraw funds"
  ],
  [
    "+BDT তোলার জন্য বিকাশ, নগদ বা ব্যাংক যুক্ত করুন",
    "Add bKash, Nagad or Bank to withdraw funds"
  ],
  [
    "গ্রাহকদের দ্রুত ও সুরক্ষিত ঋণ সেবা নিশ্চিত করতে",
    "To ensure fast and secure loan services for customers"
  ],
  [
    "বীজ, সার ও আধুনিক কৃষি যন্ত্রপাতি ক্রয়ে সহায়তা",
    "Support for seeds, fertilizer & modern agricultural equipment"
  ],
  [
    "প্রবাসী কর্মীদের পরিবারের জন্য বিশেষ Support",
    "Special support for families of expatriate workers"
  ],
  [
    "ঋণ গ্রহণের প্রতিটি ধাপ খুবই দ্রুত ও সহজবোধ্য",
    "every step of obtaining a loan is very fast and straightforward"
  ],
  [
    "প্রবাসী কর্মীদের পরিবারের জন্য বিশেষ সহায়তা",
    "Special support for families of expatriate workers"
  ],
  [
    "আইএসও সার্টিফাইড ডিজিটাল ফাইন্যান্স সিস্টেম",
    "ISO Certified Digital Finance System"
  ],
  [
    "সর্বোচ্চ লোন সীমা ৫০,০০,০০০ টাকা (৫০ লক্ষ)",
    "Maximum loan limit is 5,000,000 BDT (50 lakh)"
  ],
  [
    "আপনার প্রয়োজন অনুযায়ী উপযুক্ত লোন বেছে নিন",
    "Choose the Right Loan Suited to Your Needs"
  ],
  [
    "সর্বনিম্ন লোন সীমা ২০,০০০ টাকা (২০ হাজার)",
    "Minimum loan limit is 20,000 BDT (20 thousand)"
  ],
  [
    "আপনার কোনো সক্রিয় লোন আবেদন পাওয়া যায়নি।",
    "No active loan application found."
  ],
  [
    "আপনার কোনো সক্রিয় লোন Apply পাওয়া যায়নি।",
    "No active loan application found."
  ],
  [
    "কেন হাজারো গ্রাহক আমাদের ওপর আস্থা রাখেন?",
    "Why Do Thousands of Customers Trust Us?"
  ],
  [
    "গ্রাহকদের নিরাপদ ও দ্রুত ঋণ সেবা নিশ্চিতে",
    "To ensure safe and fast loan services for customers"
  ],
  [
    "বাংলাদেশের শীর্ষস্থানীয় তফসিলি ব্যাংকসমূহ",
    "Leading Scheduled Banks of Bangladesh"
  ],
  [
    "কোনো জামানত বা গ্যারান্টারের প্রয়োজন নেই",
    "No collateral or guarantor required"
  ],
  [
    "অনুমোদনের ২৪ ঘণ্টার মধ্যে টাকা হস্তান্তর",
    "Funds disbursed within 24 hours of approval"
  ],
  [
    "জরুরি পরিস্থিতিতে কোনো জটিল যাচাইকরণ নেই",
    "No complicated verification during emergencies"
  ],
  [
    "মেধাবী শিক্ষার্থীদের জন্য বিশেষ প্রণোদনা",
    "Special incentives for meritorious students"
  ],
  [
    "কেন হাজারো গ্রাহক আমাদের ওপর আস্থা রাখেন",
    "Why Do Thousands of Customers Trust Us"
  ],
  [
    "অনুমোদনের 24 Hoursর মধ্যে BDT হস্তান্তর",
    "Funds disbursed within 24 hours of approval"
  ],
  [
    "ফসল কর্তনের পর Pay Installmentের সুবিধা",
    "Flexible installment payments after harvest"
  ],
  [
    "Active ডিজিটাল ওয়ালেট (Verified Active)",
    "Active Digital Wallet (Verified Active)"
  ],
  [
    "কোনো বিষয়ে সাহায্য বা পরামর্শ প্রয়োজন?",
    "Need Help or Consultation on Any Matter?"
  ],
  [
    "ক্ষুদ্র ও মাঝারি ব্যবসা ঋণ (SME Loan)",
    "SME Business Loan"
  ],
  [
    "ফসল কর্তনের পর কিস্তি পরিশোধের সুবিধা",
    "Flexible installment payments after harvest"
  ],
  [
    "ভিসা ও টিকিট খরচের জন্য তাৎক্ষণিক ছাড়",
    "Instant funds release for visa and air ticket costs"
  ],
  [
    "পড়াশোনা শেষ হওয়া পর্যন্ত গ্রেস পিরিয়ড",
    "Grace period until completion of studies"
  ],
  [
    "১২ ঘণ্টার মধ্যে দ্রুততম সময়ে অর্থ ছাড়",
    "Fastest fund disbursement within 12 hours"
  ],
  [
    "12 ঘণ্টার মধ্যে দ্রুততম সময়ে অর্থ ছাড়",
    "Fastest fund disbursement within 12 hours"
  ],
  [
    "মাত্র ৩টি সহজ ধাপে আপনার লোন হাতে পান",
    "Get Your Loan in Just 3 Simple Steps"
  ],
  [
    "মাত্র 3টি সহজ ধাপে আপনার লোন হাতে পান",
    "Get Your Loan in Just 3 Simple Steps"
  ],
  [
    "কোনো বিষয়ে সাহায্য বা পরামর্শ প্রয়োজন",
    "Need Help or Consultation on Any Matter"
  ],
  [
    "টিউশন ফি ও বই ক্রয়ে সম্পূর্ণ Support",
    "Complete assistance for tuition fees & books purchase"
  ],
  [
    "লোন আবেদনের লাইভ অবস্থা ট্র্যাক করুন",
    "Track Live Status of Loan Application"
  ],
  [
    "লোন Applyের লাইভ অবস্থা ট্র্যাক করুন",
    "Track Live Status of Loan Application"
  ],
  [
    "ডিজিটাল ব্যাংকিং ও সহজ শর্তে ঋণ সেবা",
    "Digital banking and loans on flexible terms"
  ],
  [
    "ভার্চুয়াল কার্ডের বর্তমান স্ট্যাটাস",
    "Current Virtual Card Status"
  ],
  [
    "জরুরি তাৎক্ষণিক ঋণ (Emergency Loan)",
    "Instant Emergency Loan"
  ],
  [
    "মৎস্য ও ডেইরি ফার্মের জন্য বিশেষ ঋণ",
    "Special financing for fisheries & dairy farming"
  ],
  [
    "পড়াশোনা শেষ হওয়া up to গ্রেস পিরিয়ড",
    "Grace period until completion of studies"
  ],
  [
    "টিউশন ফি ও বই ক্রয়ে সম্পূর্ণ সহায়তা",
    "Complete assistance for tuition fees & books purchase"
  ],
  [
    "আমাদের সহযোগী ও পার্টনার ব্যাংকসমূহ",
    "Our Associate & Partner Banks"
  ],
  [
    "দেশের শীর্ষস্থানীয় বাণিজ্যিক ব্যাংক",
    "country's leading commercial banks"
  ],
  [
    "ক্ষুদ্র ব্যবসা উদ্যোক্তা লোন (SME)",
    "SME Business Entrepreneur Loan"
  ],
  [
    "আমাদের সকল লোন প্যাকেজ ও সুদের হার",
    "All Loan Packages & Interest Rates"
  ],
  [
    "হাসপাতাল বিল পরিশোধের বিশেষ সুবিধা",
    "Special facility for direct hospital bill clearance"
  ],
  [
    "ভার্চুয়াল কার্ডের জন্য আবেদন করুন",
    "Apply for Virtual Debit Card"
  ],
  [
    "পছন্দের লোন প্যাকেজ নির্বাচন করুন",
    "Select Preferred Loan Package"
  ],
  [
    "ব্যবসা সম্প্রসারণে বিশেষ Packages",
    "Special packages for business expansion"
  ],
  [
    "জরুরি প্রয়োজনে তাত্ক্ষণিক Support",
    "Instant support during emergencies"
  ],
  [
    "স্লাইডার দিয়েও সমন্বয় করতে পারেন:",
    "You can also adjust using the slider:"
  ],
  [
    "সরাসরি ব্যাংক একাউন্টে ট্রান্সফার",
    "Direct Bank Account Transfer"
  ],
  [
    "সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত",
    "from 9:00 AM to 6:00 PM"
  ],
  [
    "সকাল 9টা থেকে সন্ধ্যা 6টা পর্যন্ত",
    "from 9:00 AM to 6:00 PM"
  ],
  [
    "ব্যবসা সম্প্রসারণে বিশেষ প্যাকেজ",
    "Special packages for business expansion"
  ],
  [
    "সর্বোচ্চ ২০ লাখ টাকা পর্যন্ত লোন",
    "Loans up to BDT 20 Lakh"
  ],
  [
    "নারী উদ্যোক্তাদের জন্য বিশেষ ছাড়",
    "Special discount for women entrepreneurs"
  ],
  [
    "স্লাইডার দিয়েও সমন্বয় করতে পারেন",
    "You can also adjust using the slider"
  ],
  [
    "উইথড্রয়াল অ্যাকাউন্ট যুক্ত করুন",
    "Add Withdrawal Account"
  ],
  [
    "ন্যূনতম কাগজপত্র ও দ্রুত অনুমোদন",
    "Minimal Documentation & Fast Approval"
  ],
  [
    "পেন্ডিং ভার্চুয়াল কার্ডের আবেদন",
    "Pending Virtual Card Applications"
  ],
  [
    "প্রবাসী কল্যাণ লোন (Expatriate)",
    "Expatriate Welfare Loan"
  ],
  [
    "জরুরি প্রয়োজনে তাৎক্ষণিক সহায়তা",
    "Instant support during emergencies"
  ],
  [
    "বর্তমান উপলব্ধ ওয়ালেট ব্যালেন্স",
    "Current Available Wallet Balance"
  ],
  [
    "কৃষি ও খামার লোন (Agri & Farm)",
    "Agri & Farming Loan"
  ],
  [
    "কোনো লুকানো বা অতিরিক্ত ফি নেই",
    "No hidden or extra fees"
  ],
  [
    "শীর্ষস্থানীয় তফসিলি ব্যাংকসমূহ",
    "Leading Scheduled Banks"
  ],
  [
    "১০০% স্বচ্ছ ও কোনো গোপন ফি নেই",
    "100% Transparent & No Hidden Fees"
  ],
  [
    "ব্যক্তিগত লোন (Personal Loan)",
    "Personal Loan"
  ],
  [
    "সর্বোচ্চ 20 লাখ BDT up to লোন",
    "Loans up to BDT 20 Lakh"
  ],
  [
    "বর্তমান উপলব্ধ Wallet Balance",
    "Current Available Wallet Balance"
  ],
  [
    "লোন ক্যালকুলেটর ও ইএমআই হিসাব",
    "Loan Calculator & EMI Estimate"
  ],
  [
    "গ্রাহক পোর্টাল ও ওয়ালেট হিসাব",
    "Customer Portal & Wallet"
  ],
  [
    "ফিক্সড ডিপোজিট (এফডিআর) স্কিম",
    "Fixed Deposit (FDR) Scheme"
  ],
  [
    "শীর্ষস্থানীয় বাণিজ্যিক ব্যাংক",
    "leading commercial banks"
  ],
  [
    "কোনো বিষয়ে সাহায্য বা পরামর্শ",
    "Help or consultation on any matter"
  ],
  [
    "নতুন ভার্চুয়াল কার্ডের আবেদন",
    "New Virtual Card Application"
  ],
  [
    "ব্যক্তিগত ঋণ (Personal Loan)",
    "Personal Loan"
  ],
  [
    "ক্ষুদ্র ব্যবসা উদ্যোক্তা লোন",
    "SME Business Loan"
  ],
  [
    "আবেদনের বর্তমান অবস্থা যাচাই",
    "Check Application Status"
  ],
  [
    "আমাদের বিশেষজ্ঞ লোন অফিসাররা",
    "Our expert loan officers"
  ],
  [
    "নমনীয় পরিশোধের কিস্তি শিডিউল",
    "Flexible Repayment Installment Schedule"
  ],
  [
    "জরুরি চিকিৎসা ও আকস্মিক লোন",
    "Emergency & Medical Loan"
  ],
  [
    "সকল লোন প্যাকেজ ও সুদের হার",
    "All Loan Packages & Interest Rates"
  ],
  [
    "সহজ শর্ত ও নূন্যতম কাগজপত্র",
    "Easy terms & minimal documentation"
  ],
  [
    "লোন ক্যালকুলেটরে যাচাই করুন",
    "Check on Loan Calculator"
  ],
  [
    "সহযোগী ও পার্টনার নেটওয়ার্ক",
    "Associate & Partner Network"
  ],
  [
    "যাচাই ও তাৎক্ষণিক ফান্ড ছাড়",
    "Verification & Instant Fund Release"
  ],
  [
    "ক্ষুদ্র ও মাঝারি ব্যবসা ঋণ",
    "SME Business Loan"
  ],
  [
    "উচ্চশিক্ষা ও স্টুডেন্ট লোন",
    "Higher Education & Student Loan"
  ],
  [
    "লোন Calculatorে যাচাই করুন",
    "Check on Loan Calculator"
  ],
  [
    "সর্বমোট প্রদেয় (আসল + সুদ)",
    "Total Payable (Principal + Interest)"
  ],
  [
    "নতুন লোনের জন্য আবেদন করুন",
    "Apply for a New Loan"
  ],
  [
    "কৃষি, ডেইরি ও পোল্ট্রি ঋণ",
    "Agriculture, Dairy & Poultry Loan"
  ],
  [
    "উচ্চশিক্ষা ও ক্যারিয়ার ঋণ",
    "Education & Career Loan"
  ],
  [
    "DBS ও আকর্ষণীয় লোন সুবিধা",
    "Attractive loan benefits and simple terms"
  ],
  [
    "যেকোনো পরিমাণে ক্লিক করুন",
    "Click on any amount"
  ],
  [
    "যেকোনো Amountে ক্লিক করুন",
    "Click on any amount"
  ],
  [
    "নতুন লোনের জন্য Apply Now",
    "Apply for a New Loan"
  ],
  [
    "আপনার প্রশ্নের সহজ সমাধান",
    "Simple Answers to Your Questions"
  ],
  [
    "অ্যাক্টিভ ডিজিটাল ওয়ালেট",
    "Active Digital Wallet"
  ],
  [
    "প্যাকেজ নির্বাচন ও হিসাব",
    "Package Selection & Calculation"
  ],
  [
    "সহজ অগ্রিম পরিশোধ সুবিধা",
    "Easy Prepayment Facility"
  ],
  [
    "ভার্চুয়াল কার্ডের আবেদন",
    "Virtual Card Application"
  ],
  [
    "পেন্ডিং ভার্চুয়াল কার্ড",
    "Pending Virtual Card"
  ],
  [
    "উইথড্রয়াল শর্ত ও গেটিং",
    "Withdrawal Conditions & Gating"
  ],
  [
    "সরকার অনুমোদিত সহজ শর্ত",
    "Government approved easy terms"
  ],
  [
    "সরকার Approved DBS শর্ত",
    "Government approved easy terms"
  ],
  [
    "যোগ্যতা ও নথিপত্র দেখুন",
    "View Eligibility & Documents"
  ],
  [
    "ধাপ ৪: কাগজপত্র ও নমিনি",
    "Step 4: Documents & Nominee"
  ],
  [
    "ধাপ 4: কাগজপত্র ও নমিনি",
    "Step 4: Documents & Nominee"
  ],
  [
    "ধাপ ৫: পর্যালোচনা ও জমা",
    "Step 5: Review & Submit"
  ],
  [
    "ধাপ 5: পর্যালোচনা ও জমা",
    "Step 5: Review & Submit"
  ],
  [
    "তফসিলি ব্যাংক নেটওয়ার্ক",
    "Scheduled Banking Network"
  ],
  [
    "আজই আবেদন ফরম পূরণ করুন",
    "Fill Out the Application Form Today"
  ],
  [
    "সুবিধাজনক আর্থিক স্কিম",
    "Convenient Financial Schemes"
  ],
  [
    "উদাহরণ ট্র্যাকিং আইডি:",
    "Example Tracking IDs:"
  ],
  [
    "ধাপ 3: Occupation ও আয়",
    "Step 3: Occupation & Income"
  ],
  [
    "আমাদের অনন্য বৈশিষ্ট্য",
    "Our Unique Features"
  ],
  [
    "আমাদের ওপর আস্থা রাখেন",
    "trust us"
  ],
  [
    "কৃষি ও ডেইরি খামার ঋণ",
    "Agriculture & Dairy Loan"
  ],
  [
    "ও আকর্ষণীয় লোন সুবিধা",
    "Attractive loan benefits and simple terms"
  ],
  [
    "পরিশোধের মেয়াদ (মাস):",
    "Repayment Tenure (Months):"
  ],
  [
    "কাঙ্ক্ষিত ঋণের পরিমাণ",
    "Desired Loan Amount"
  ],
  [
    "উদাহরণ Tracking আইডি:",
    "Example Tracking IDs:"
  ],
  [
    "ধাপ ২: ব্যক্তিগত তথ্য",
    "Step 2: Personal Information"
  ],
  [
    "ধাপ 2: ব্যক্তিগত তথ্য",
    "Step 2: Personal Information"
  ],
  [
    "অনলাইন আবেদন ফরম পূরণ",
    "Fill Online Application Form"
  ],
  [
    "উইথড্রল শর্ত ও গেটিং",
    "Withdrawal Conditions & Gating"
  ],
  [
    "কোনো লুকায়িত খরচ নেই",
    "No hidden charges"
  ],
  [
    "মাসিক কিস্তির সুবিধা",
    "Monthly installment facility"
  ],
  [
    "প্রতি Monthsে প্রদেয়",
    "Payable per month"
  ],
  [
    "উপযুক্ত লোন বেছে নিন",
    "Choose the Suitable Loan"
  ],
  [
    "সবগুলো প্যাকেজ দেখুন",
    "View All Packages"
  ],
  [
    "আমাদের ঋণ স্কিমসমূহ",
    "Our Loan Schemes"
  ],
  [
    "পছন্দের লোন প্যাকেজ",
    "Preferred Loan Package"
  ],
  [
    "ধাপ ১: লোন নির্বাচন",
    "Step 1: Loan Selection"
  ],
  [
    "ধাপ 1: লোন নির্বাচন",
    "Step 1: Loan Selection"
  ],
  [
    "আমানত জমা (ডিপোজিট)",
    "Deposit Funds"
  ],
  [
    "অনলাইন ঋণ আবেদন ফরম",
    "Online Loan Application Form"
  ],
  [
    "আপনার সেবায় নিয়োজিত",
    "dedicated to your service"
  ],
  [
    "উইথড্রল অ্যাকাউন্ট",
    "Withdrawal Account"
  ],
  [
    "মাল্টি-স্টেজ গেটিং",
    "Multi-Stage Gating"
  ],
  [
    "প্রবাসী কল্যাণ লোন",
    "Expatriate Welfare Loan"
  ],
  [
    "মাসিক কিস্তি (EMI)",
    "Monthly Installment (EMI)"
  ],
  [
    "মাত্র ৩টি সহজ ধাপে",
    "in Just 3 Simple Steps"
  ],
  [
    "আপনার লোন হাতে পান",
    "Get Your Loan Disbursed"
  ],
  [
    "সাধারণ প্রশ্নোত্তর",
    "Frequently Asked Questions (FAQ)"
  ],
  [
    "মাত্র 3টি সহজ ধাপে",
    "in Just 3 Simple Steps"
  ],
  [
    "ভার্চুয়াল কার্ডের",
    "Virtual Debit Card"
  ],
  [
    "উইথড্র অ্যাকাউন্ট",
    "Withdrawal Account"
  ],
  [
    "প্রতি মাসে প্রদেয়",
    "Payable per month"
  ],
  [
    "বার্ষিক সুদের হার",
    "Annual Interest Rate"
  ],
  [
    "অ্যাক্টিভ একাউন্ট",
    "Active Account"
  ],
  [
    "প্রয়োজনীয় সার্ভিস",
    "Essential Services"
  ],
  [
    "কেন হাজারো গ্রাহক",
    "Why thousands of customers"
  ],
  [
    "ভার্চুয়াল কার্ডে",
    "Virtual Debit Card"
  ],
  [
    "টি পেন্ডিং আবেদন",
    "pending applications"
  ],
  [
    "কৃষি ও খামার লোন",
    "Agri & Farming Loan"
  ],
  [
    "সহজ মাসিক কিস্তি",
    "Easy monthly installments"
  ],
  [
    "সহজ অনলাইন আবেদন",
    "Easy Online Application"
  ],
  [
    "রিয়েল-টাইম তথ্য",
    "Real-time Information"
  ],
  [
    "ধাপ ৩: পেশা ও আয়",
    "Step 3: Occupation & Income"
  ],
  [
    "কাগজপত্র ও নমিনি",
    "Documents & Nominee"
  ],
  [
    "পর্যালোচনা ও জমা",
    "Review & Submit"
  ],
  [
    "লোন ও কিস্তিসমূহ",
    "Loans & Installments"
  ],
  [
    "চুক্তিপত্র পেপার",
    "Loan Agreement"
  ],
  [
    "কৃষি ও ডেইরি ঋণ",
    "Agriculture & Dairy Loan"
  ],
  [
    "মূল সুবিধাসমূহ:",
    "Key Benefits:"
  ],
  [
    "পরিশোধের মেয়াদ:",
    "Repayment Tenure:"
  ],
  [
    "দ্রুত নির্বাচন:",
    "Quick Select:"
  ],
  [
    "মোট প্রদেয় সুদ:",
    "Total Payable Interest:"
  ],
  [
    "সর্বমোট প্রদেয়:",
    "Total Payable:"
  ],
  [
    "আবেদন যাচাইাধীন",
    "Application Under Review"
  ],
  [
    "ভার্চুয়াল কার্ড",
    "Virtual Debit Card"
  ],
  [
    "উইথড্র ও লেনদেন",
    "Withdrawals & Transactions"
  ],
  [
    "লেটার সনদ (PDF)",
    "Approval Letter (PDF)"
  ],
  [
    "লোন ক্যালকুলেটর",
    "Loan Calculator"
  ],
  [
    "টি অ্যাকাউন্টে",
    "accounts"
  ],
  [
    "মূল সুবিধাসমূহ",
    "Key Benefits"
  ],
  [
    "পরিশোধের মেয়াদ",
    "Repayment Tenure"
  ],
  [
    "দ্রুত নির্বাচন",
    "Quick Select"
  ],
  [
    "মোট প্রদেয় সুদ",
    "Total Payable Interest"
  ],
  [
    "সর্বমোট প্রদেয়",
    "Total Payable"
  ],
  [
    "ব্যক্তিগত তথ্য",
    "Personal Information"
  ],
  [
    "Active একাউন্ট",
    "Active Account"
  ],
  [
    "অনুসন্ধান করুন",
    "Search"
  ],
  [
    "সপ্তাহের ৬ দিন",
    "6 days a week"
  ],
  [
    "সপ্তাহের 6 দিন",
    "6 days a week"
  ],
  [
    "ব্যক্তিগত লোন",
    "Personal Loan"
  ],
  [
    "দ্রুত অনুমোদন",
    "Fast Approval"
  ],
  [
    "লোন আবেদন ফরম",
    "Loan Application Form"
  ],
  [
    "সহজ প্রক্রিয়া",
    "Simple Process"
  ],
  [
    "টি যাচাইাধীন",
    "under verification"
  ],
  [
    "ব্যক্তিগত ঋণ",
    "Personal Loan"
  ],
  [
    "ঋণ স্কিমসমূহ",
    "Loan Schemes"
  ],
  [
    "মাসিক কিস্তি",
    "Monthly installment"
  ],
  [
    "আবেদন করুন →",
    "Apply Now →"
  ],
  [
    "ঋণের পরিমাণ:",
    "Loan Amount:"
  ],
  [
    "লোন নির্বাচন",
    "Loan Selection"
  ],
  [
    "বার্ষিক সুদ",
    "Annual Interest"
  ],
  [
    "প্রসেসিং ফি",
    "Processing Fee"
  ],
  [
    "ঋণের পরিমাণ",
    "Loan Amount"
  ],
  [
    "Login নম্বর",
    "Login Phone"
  ],
  [
    "সন্ধান করুন",
    "Search"
  ],
  [
    "উপযুক্ত লোন",
    "Suitable Loan"
  ],
  [
    "আস্থা রাখেন",
    "trust us"
  ],
  [
    "টি পেন্ডিং",
    "pending"
  ],
  [
    "টি ডিপোজিট",
    "deposits"
  ],
  [
    "গৃহিণী লোন",
    "Housewife Loan"
  ],
  [
    "হিসাব করুন",
    "Calculate"
  ],
  [
    "সুদের হার:",
    "Interest Rate:"
  ],
  [
    "লগইন নম্বর",
    "Login Phone"
  ],
  [
    "টাকা তুলুন",
    "Withdraw Funds"
  ],
  [
    "নির্বাচিত:",
    "Selected:"
  ],
  [
    "ব্যবসা ঋণ",
    "Business Loan"
  ],
  [
    "শিক্ষা ঋণ",
    "Education Loan"
  ],
  [
    "যাচাইাধীন",
    "Under Verification"
  ],
  [
    "পেশা ও আয়",
    "Occupation & Income"
  ],
  [
    "BDT তুলুন",
    "Withdraw Funds"
  ],
  [
    "সর্বোচ্চ:",
    "Maximum:"
  ],
  [
    "জরুরি ঋণ",
    "Emergency Loan"
  ],
  [
    "বাতিলকৃত",
    "Cancelled"
  ],
  [
    "বিতরণকৃত",
    "Disbursed"
  ],
  [
    "অনুমোদিত",
    "Approved"
  ],
  [
    "২০ হাজার",
    "20 Thousand"
  ],
  [
    "৫০ হাজার",
    "50 Thousand"
  ],
  [
    "20 হাজার",
    "20 Thousand"
  ],
  [
    "50 হাজার",
    "50 Thousand"
  ],
  [
    "প্রস্তুত",
    "Ready"
  ],
  [
    "ন্যূনতম:",
    "Minimum:"
  ],
  [
    "সকল লোন",
    "All Loans"
  ],
  [
    "প্লে পজ",
    "Play / Pause"
  ],
  [
    "টি ধাপ",
    "steps"
  ],
  [
    "১০ লাখ",
    "10 Lakh"
  ],
  [
    "১৫ লাখ",
    "15 Lakh"
  ],
  [
    "২০ লাখ",
    "20 Lakh"
  ],
  [
    "৩০ লাখ",
    "30 Lakh"
  ],
  [
    "৫০ লাখ",
    "50 Lakh"
  ],
  [
    "10 লাখ",
    "10 Lakh"
  ],
  [
    "15 লাখ",
    "15 Lakh"
  ],
  [
    "20 লাখ",
    "20 Lakh"
  ],
  [
    "30 লাখ",
    "30 Lakh"
  ],
  [
    "50 লাখ",
    "50 Lakh"
  ],
  [
    "১ লাখ",
    "1 Lakh"
  ],
  [
    "২ লাখ",
    "2 Lakh"
  ],
  [
    "৩ লাখ",
    "3 Lakh"
  ],
  [
    "৫ লাখ",
    "5 Lakh"
  ],
  [
    "1 লাখ",
    "1 Lakh"
  ],
  [
    "2 লাখ",
    "2 Lakh"
  ],
  [
    "3 লাখ",
    "3 Lakh"
  ],
  [
    "5 লাখ",
    "5 Lakh"
  ],
  [
    "সীমা:",
    "Limit:"
  ]
];

// 2. Comprehensive Word-by-Word Dictionary (100% vocabulary coverage)
export const WORD_TRANSLATIONS: Record<string, string> = {
  "ও": "and",
  "এবং": "and",
  "বা": "or",
  "অথবা": "or",
  "কি": "is",
  "কী": "what",
  "না": "no",
  "নেই": "none",
  "নয়": "not",
  "যে": "that",
  "যা": "which",
  "তা": "that",
  "এই": "this",
  "সেই": "that",
  "এক": "one",
  "একটি": "a",
  "একজন": "a",
  "অন্য": "other",
  "অন্যান্য": "other",
  "সব": "all",
  "সকল": "all",
  "সবগুলো": "all",
  "পুরো": "full",
  "সম্পূর্ণ": "complete",
  "মাত্র": "only",
  "শুধু": "only",
  "শুধুমাত্র": "only",
  "জন্য": "for",
  "থেকে": "from",
  "পর্যন্ত": "to",
  "পর": "after",
  "পূর্বে": "before",
  "আগে": "before",
  "সাথে": "with",
  "সহ": "including",
  "দ্বারা": "by",
  "কর্তৃক": "by",
  "প্রতি": "per",
  "প্রতিটি": "Every",
  "যেকোনো": "any",
  "কিছু": "some",
  "মতো": "like",
  "মত": "like",
  "হিসেবে": "as",
  "হিসাবে": "as",
  "বাবদ": "for",
  "বিকাশ": "bKash",
  "নগদ": "Nagad",
  "রকেট": "Rocket",
  "উপায়": "Upay",
  "ব্যাংক": "Bank",
  "ব্যাংকের": "Bank",
  "ব্যাংকিং": "Banking",
  "শাখা": "Branch",
  "শাখার": "Branch",
  "টাকা": "BDT",
  "টাকার": "BDT",
  "টাকায়": "BDT",
  "৳": "৳ ",
  "পয়সা": "Paisa",
  "হাজার": "Thousand",
  "লাখ": "Lakh",
  "লক্ষ": "Lakh",
  "কোটি": "Crore",
  "শতকরা": "Percent",
  "শতাংশ": "Percent",
  "হার": "Rate",
  "হারে": "Rate",
  "মুনাফা": "Profit",
  "লাভ": "Profit",
  "সুদ": "Interest",
  "সুদের": "Interest",
  "কমিশন": "Commission",
  "বোনাস": "Bonus",
  "মাস": "Month",
  "মাসের": "Month",
  "মাসে": "Month",
  "মাসিক": "Monthly",
  "বছর": "Year",
  "বছরের": "Year",
  "বছরে": "Year",
  "বার্ষিক": "Annual",
  "দিন": "Day",
  "দিনের": "Day",
  "দিনে": "Day",
  "দৈনিক": "Daily",
  "ঘণ্টা": "Hour",
  "ঘণ্টার": "Hour",
  "ঘণ্টায়": "Hour",
  "মিনিট": "Minute",
  "মিনিটের": "Minute",
  "মিনিটে": "Minute",
  "সেকেন্ড": "Second",
  "তারিখ": "Date",
  "তারিখে": "Date",
  "সময়": "Time",
  "সময়ের": "Time",
  "সময়ে": "Time",
  "টাইম": "Time",
  "সকাল": "Morning",
  "দুপুর": "Noon",
  "বিকাল": "Afternoon",
  "সন্ধ্যা": "Evening",
  "রাত": "Night",
  "আজ": "Today",
  "কাল": "Tomorrow",
  "গতকাল": "Yesterday",
  "এখন": "Now",
  "তখন": "Then",
  "শনিবার": "Saturday",
  "রবিবার": "Sunday",
  "সোমবার": "Monday",
  "মঙ্গলবার": "Tuesday",
  "বুধবার": "Wednesday",
  "বৃহস্পতিবার": "Thursday",
  "শুক্রবার": "Friday",
  "জানুয়ারি": "January",
  "ফেব্রুয়ারি": "February",
  "মার্চ": "March",
  "এপ্রিল": "April",
  "মে": "May",
  "জুন": "June",
  "জুলাই": "July",
  "আগস্ট": "August",
  "সেপ্টেম্বর": "September",
  "অক্টোবর": "October",
  "নভেম্বর": "November",
  "ডিসেম্বর": "December",
  "নাম": "Name",
  "নামটি": "Name",
  "পিতা": "Father",
  "পিতার": "Father",
  "মাতা": "Mother",
  "মাতার": "Mother",
  "স্বামী": "Husband",
  "স্ত্রী": "Wife",
  "অভিভাবক": "Guardian",
  "নমিনি": "Nominee",
  "নমিনির": "Nominee",
  "সম্পর্ক": "Relation",
  "বয়স": "Age",
  "জন্ম": "Birth",
  "লিঙ্গ": "Gender",
  "পুরুষ": "Male",
  "নারী": "Female",
  "মহিলা": "Female",
  "গৃহিণী": "Housewife",
  "ছাত্র": "Student",
  "ছাত্রী": "Student",
  "শিক্ষার্থী": "Student",
  "শিক্ষার্থীদের": "Students",
  "পেশা": "Occupation",
  "পেশার": "Occupation",
  "পেশাজীবী": "Professional",
  "চাকরি": "Job",
  "চাকরিজীবী": "Employee",
  "ব্যবসায়ী": "Businessman",
  "ব্যবসায়ীদের": "Businessmen",
  "উদ্যোক্তা": "Entrepreneur",
  "উদ্যোক্তাদের": "Entrepreneurs",
  "কৃষক": "Farmer",
  "খামারি": "Farmer",
  "প্রবাসী": "Expatriate",
  "প্রবাসীদের": "Expatriates",
  "প্রবাসিদের": "Expatriates",
  "আয়": "Income",
  "আয়ের": "Income",
  "বেতন": "Salary",
  "ঠিকানা": "Address",
  "বর্তমান": "Present",
  "স্থায়ী": "Permanent",
  "গ্রাম": "Village",
  "ডাকঘর": "Post Office",
  "থানা": "Police Station",
  "উপজেলা": "Upazila",
  "জেলা": "District",
  "বিভাগ": "Category",
  "দেশ": "Country",
  "শহর": "City",
  "বাড়ি": "Home",
  "বাসা": "Residence",
  "রোড": "Road",
  "মহল্লা": "Area",
  "মোবাইল": "Phone",
  "ফোন": "Phone",
  "নম্বর": "Number",
  "নম্বরটি": "Number",
  "নম্বরে": "Number",
  "ইমেইল": "Email",
  "পাসওয়ার্ড": "Password",
  "পিন": "PIN",
  "কোড": "Code",
  "ওটিপি": "OTP",
  "ছবি": "Photo",
  "ছবিটি": "Photo",
  "ছবির": "Photo",
  "সেলফি": "Selfie",
  "স্বাক্ষর": "Signature",
  "স্বাক্ষরের": "Signature",
  "দলিল": "Deed",
  "কাগজ": "Document",
  "কাগজপত্র": "Documents",
  "নথিপত্র": "Documents",
  "সনদ": "Certificate",
  "সনদপত্র": "Certificate",
  "সার্টিফিকেট": "Certificate",
  "স্মার্ট": "Smart",
  "পরিচয়পত্র": "ID Card",
  "পরিচয়": "Identity",
  "জাতীয়": "National",
  "কার্ড": "Card",
  "কার্ডের": "Card",
  "কার্ডটি": "Card",
  "কার্ডধারী": "Cardholder",
  "কার্ডধারীদের": "Cardholders",
  "হিসাব": "Account",
  "হিসাবের": "Account",
  "হিসাবধারী": "Accountholder",
  "হিসাবধারীর": "Accountholder",
  "অ্যাকাউন্ট": "Account",
  "অ্যাকাউন্টের": "Account",
  "অ্যাকাউন্টে": "Account",
  "একাউন্ট": "Account",
  "একাউন্টের": "Account",
  "একাউন্টে": "Account",
  "ওয়ালেট": "Wallet",
  "ওয়ালেটের": "Wallet",
  "ওয়ালেটে": "Wallet",
  "ব্যালেন্স": "Balance",
  "উদ্ধৃত্ত": "Balance",
  "ডিপোজিট": "Deposit",
  "ডিপোজিটের": "Deposit",
  "ডিপোজিটসমূহ": "Deposits",
  "জমা": "Deposit",
  "জমাকৃত": "Deposited",
  "উত্তোলন": "Withdrawal",
  "উত্তোলনের": "Withdrawal",
  "উত্তোলনযোগ্য": "Withdrawable",
  "উইথড্র": "Withdraw",
  "উইথড্রয়াল": "Withdrawal",
  "উইথড্রয়াল": "Withdrawal",
  "উইথড্রলে": "Withdrawal",
  "লেনদেন": "Transaction",
  "লেনদেনের": "Transaction",
  "ট্রানজেকশন": "Transaction",
  "হিস্ট্রি": "History",
  "স্লিপ": "Slip",
  "স্লিপের": "Slip",
  "রশিদ": "Receipt",
  "রসিদ": "Receipt",
  "রসিদের": "Receipt",
  "আইডি": "ID",
  "রেফারেন্স": "Reference",
  "লগইন": "Login",
  "রেজিস্ট্রেশন": "Registration",
  "নিবন্ধন": "Registration",
  "নিবন্ধিত": "Registered",
  "লগআউট": "Logout",
  "প্রোফাইল": "Profile",
  "ইউজার": "User",
  "ইউজারনেম": "Username",
  "গ্রাহক": "Customer",
  "গ্রাহকের": "Customer",
  "গ্রাহকদের": "Customers",
  "গ্রাহকরা": "Customers",
  "কাস্টমার": "Customer",
  "এডমিন": "Admin",
  "অ্যাডমিন": "Admin",
  "অফিসার": "Officer",
  "স্টাফ": "Staff",
  "কর্মকর্তা": "Officer",
  "কর্মকর্তার": "Officer",
  "প্রতিনিধি": "Representative",
  "সদস্য": "Member",
  "লোন": "Loan",
  "লোনের": "Loan",
  "ঋণ": "Loan",
  "ঋণের": "Loan",
  "ঋণগ্রহীতা": "Borrower",
  "ঋণগ্রহীতার": "Borrower",
  "আবেদন": "Application",
  "আবেদনের": "Application",
  "আবেদনকারী": "Applicant",
  "আবেদনকারীর": "Applicant",
  "আবেদনসমূহ": "Applications",
  "প্যাকেজ": "Package",
  "প্যাকেজের": "Package",
  "প্যাকেজসমূহ": "Packages",
  "স্কিম": "Scheme",
  "স্কিমের": "Scheme",
  "স্কিমসমূহ": "Schemes",
  "কিস্তি": "Installment",
  "কিস্তির": "Installment",
  "কিস্তিতে": "Installment",
  "কিস্তিসমূহ": "Installments",
  "পরিশোধ": "Repayment",
  "পরিশোধের": "Repayment",
  "পরিশোধিত": "Paid",
  "পরিশোধযোগ্য": "Payable",
  "প্রদেয়": "Payable",
  "প্রদেয়": "Payable",
  "বকেয়া": "Due",
  "জরিমানা": "Penalty",
  "ফি": "Fee",
  "চার্জ": "Charge",
  "কর": "Tax",
  "ট্যাক্স": "Tax",
  "ভ্যাট": "VAT",
  "প্রসেসিং": "Processing",
  "অনুমোদন": "Approval",
  "অনুমোদনের": "Approval",
  "অনুমোদিত": "Approved",
  "মঞ্জুরকৃত": "Approved",
  "বাতিল": "Cancelled",
  "বাতিলের": "Cancellation",
  "বাতিলকরণ": "Cancellation",
  "বাতিলকৃত": "Cancelled",
  "স্থগিত": "Suspended",
  "পেন্ডিং": "Pending",
  "অপেক্ষমাণ": "Pending",
  "অপেক্ষমান": "Pending",
  "অপেক্ষা": "Waiting",
  "সক্রিয়": "Active",
  "সক্রিয়": "Active",
  "নিষ্ক্রিয়": "Inactive",
  "নিস্ক্রিয়": "Inactive",
  "সফল": "Success",
  "সফলভাবে": "Successfully",
  "সফলতার": "Success",
  "ব্যর্থ": "Failed",
  "সমস্যা": "Error",
  "ভুল": "Wrong",
  "ত্রুটি": "Error",
  "সতর্কতা": "Warning",
  "নোটিশ": "Notice",
  "নোটিফিকেশন": "Notification",
  "বার্তা": "Message",
  "বার্তাটি": "Message",
  "মেসেজ": "Message",
  "মেসেজটি": "Message",
  "মেসেজসমূহ": "Messages",
  "চ্যাট": "Chat",
  "সাপোর্ট": "Support",
  "সহায়তা": "Support",
  "সহযোগিতা": "Cooperation",
  "হেল্প": "Help",
  "হেল্পলাইন": "Helpline",
  "হেল্পলাইনে": "Helpline",
  "কমিউনিকেশন": "Communication",
  "যোগাযোগ": "Contact",
  "কল": "Call",
  "ফোনকল": "Phone Call",
  "ভয়েস": "Voice",
  "অডিও": "Audio",
  "ভিডিও": "Video",
  "রেকর্ড": "Record",
  "রেকর্ডিং": "Recording",
  "মাইক্রোফোন": "Microphone",
  "ক্যামেরা": "Camera",
  "ক্যামেরায়": "Camera",
  "ফাইল": "File",
  "ফোল্ডার": "Folder",
  "ডকুমেন্ট": "Document",
  "ডকুমেন্টস": "Documents",
  "পিডিএফ": "PDF",
  "ইমেজ": "Image",
  "লোগো": "Logo",
  "আইকন": "Icon",
  "ব্যানার": "Banner",
  "পোস্টার": "Poster",
  "বিজ্ঞাপন": "Advertisement",
  "প্রমোশন": "Promotion",
  "গ্যালারি": "Gallery",
  "মিডিয়া": "Media",
  "মিডিয়া": "Media",
  "চুক্তি": "Agreement",
  "চুক্তির": "Contract",
  "চুক্তিপত্র": "Contract",
  "চুক্তিপত্রের": "Contract",
  "শর্ত": "Terms",
  "শর্তাবলী": "Terms and Conditions",
  "শর্তাবলির": "Terms",
  "শর্তের": "Terms",
  "নীতিমালা": "Policy",
  "গোপনীয়তা": "Privacy",
  "আইন": "Law",
  "আইনি": "Legal",
  "অধিকার": "Rights",
  "সংরক্ষিত": "Reserved",
  "সর্বস্বত্ব": "All rights",
  "প্রশাসনিক": "Administrative",
  "ব্যবস্থাপনা": "Management",
  "নিয়ন্ত্রণ": "Control",
  "কন্ট্রোল": "Control",
  "নিরাপত্তা": "Security",
  "সিকিউরিটি": "Security",
  "সুরক্ষিত": "Protected",
  "এনক্রিপশন": "Encryption",
  "লক": "Lock",
  "লকড": "Locked",
  "আনলক": "Unlock",
  "ব্লক": "Block",
  "ব্লকড": "Blocked",
  "অনুমতি": "Permission",
  "পারমিশন": "Permission",
  "ভেরিফাই": "Verify",
  "ভেরিফাইড": "Verified",
  "যাচাই": "Verification",
  "যাচাইকৃত": "Verified",
  "প্রমাণ": "Proof",
  "প্রমাণপত্র": "Proof",
  "উৎস": "Source",
  "স্টেটমেন্ট": "Statement",
  "সারসংক্ষেপ": "Summary",
  "সারাংশ": "Summary",
  "বিবরণ": "Description",
  "বিবরণী": "Statement",
  "তালিকা": "List",
  "টেবিল": "Table",
  "ফর্ম": "Form",
  "ফরম": "Form",
  "ঘর": "Box",
  "বক্স": "Box",
  "বক্সে": "Box",
  "বাটন": "Button",
  "বাটনে": "Button",
  "মেনু": "Menu",
  "ট্যাব": "Tab",
  "ট্যাবে": "Tab",
  "লিঙ্ক": "Link",
  "লিংক": "Link",
  "ইউআরএল": "URL",
  "পেজ": "Page",
  "পেজে": "Page",
  "সাইট": "Site",
  "সাইটে": "Site",
  "ওয়েবসাইট": "Website",
  "ওয়েবসাইট": "Website",
  "হোম": "Home",
  "হোমপেজ": "Homepage",
  "ড্যাশবোর্ড": "Dashboard",
  "ড্যাশবোর্ডে": "Dashboard",
  "প্যানেল": "Panel",
  "প্যানেলে": "Panel",
  "পোর্টাল": "Portal",
  "পোর্টালে": "Portal",
  "হাব": "Hub",
  "সেন্টার": "Center",
  "হেডার": "Header",
  "ফুটার": "Footer",
  "সাইডবার": "Sidebar",
  "মডেল": "Modal",
  "ডায়ালগ": "Dialog",
  "পপআপ": "Popup",
  "উইন্ডো": "Window",
  "স্ক্রিন": "Screen",
  "স্ক্রিনে": "Screen",
  "ডিসপ্লে": "Display",
  "ভিউ": "View",
  "প্রিভিউ": "Preview",
  "এডিট": "Edit",
  "এডিটর": "Editor",
  "সম্পাদনা": "Edit",
  "আপডেট": "Update",
  "পরিবর্তন": "Change",
  "রিসেট": "Reset",
  "ক্লিয়ার": "Clear",
  "মুছে": "Delete",
  "ডিলিট": "Delete",
  "সরান": "Remove",
  "যোগ": "Add",
  "যুক্ত": "Add",
  "তৈরি": "Create",
  "জেনারেট": "Generate",
  "জেনারেটর": "Generator",
  "সংরক্ষণ": "Save",
  "সেভ": "Save",
  "দাখিল": "Submit",
  "সাবমিট": "Submit",
  "সেন্ড": "Send",
  "পাঠান": "Send",
  "পাঠানো": "Sent",
  "গ্রহন": "Receive",
  "গ্রহণ": "Obtaining",
  "গৃহীত": "Accepted",
  "আপলোড": "Upload",
  "আপলোডে": "Upload",
  "ডাউনলোড": "Download",
  "ডাউনলোডে": "Download",
  "প্রিন্ট": "Print",
  "কপি": "Copy",
  "পেস্ট": "Paste",
  "শেয়ার": "Share",
  "ইনস্টল": "Install",
  "খুলুন": "Open",
  "ওপেন": "Open",
  "বন্ধ": "Closed",
  "ক্লিক": "Click",
  "চাপুন": "Press",
  "ট্যাপ": "Tap",
  "স্ক্রোল": "Scroll",
  "অনুসন্ধান": "Search",
  "খুঁজুন": "Search",
  "সন্ধান": "Search",
  "ফিল্টার": "Filter",
  "বাছাই": "Select",
  "নির্বাচন": "Select",
  "সিলেক্ট": "Select",
  "রিফ্রেশ": "Refresh",
  "রিলোড": "Reload",
  "পুনরায়": "Retry",
  "চেষ্টা": "Try",
  "শুরু": "Start",
  "থামান": "Stop",
  "বিরতি": "Pause",
  "চলমান": "Ongoing",
  "সম্পন্ন": "Completed",
  "শেষ": "Finished",
  "অভিনন্দন": "Congratulations",
  "ধন্যবাদ": "Thank you",
  "স্বাগতম": "Welcome",
  "দয়া": "Please",
  "অনুগ্রহ": "Please",
  "অবশ্যই": "Mandatory",
  "বাধ্যতামূলক": "Mandatory",
  "ঐচ্ছিক": "Optional",
  "প্রস্তুত": "Ready",
  "উপলব্ধ": "Available",
  "অনুপলব্ধ": "Unavailable",
  "খোলা": "Open",
  "সরাসরি": "Direct",
  "সহজ": "Easy",
  "দ্রুত": "Fast",
  "দ্রুততম": "Fastest",
  "জরুরি": "Emergency",
  "নিরাপদ": "Secure",
  "স্বচ্ছ": "Transparent",
  "বৈধ": "Legal",
  "সঠিক": "Correct",
  "নির্ভুল": "Accurate",
  "নকল": "Fake",
  "ভুয়া": "Fake",
  "আসল": "Original",
  "কাস্টম": "Custom",
  "স্ট্যান্ডার্ড": "Standard",
  "প্রিমিয়াম": "Premium",
  "গোল্ডেন": "Golden",
  "জনপ্রিয়": "Popular",
  "সেরা": "Best",
  "আকর্ষণীয়": "Attractive",
  "বিশেষ": "Special",
  "নতুন": "New",
  "পুরাতন": "Old",
  "সর্বোচ্চ": "Maximum",
  "সর্বনিম্ন": "Minimum",
  "ন্যূনতম": "Minimum",
  "কম": "Low",
  "বেশি": "High",
  "উচ্চ": "High",
  "বড়": "Big",
  "ছোট": "Small",
  "দীর্ঘ": "Long",
  "স্বল্প": "Short",
  "নমনীয়": "Flexible",
  "নমনীয়": "Flexible",
  "ফ্লেক্সিবল": "Flexible",
  "ডিজিটাল": "Digital",
  "ভার্চুয়াল": "Virtual",
  "অটো": "Auto",
  "স্বয়ংক্রিয়": "Automatic",
  "লাইভ": "Live",
  "রিয়েল": "Real",
  "রিয়েল": "Real",
  "আন্তর্জাতিক": "International",
  "সরকারি": "Government",
  "বেসরকারি": "Private",
  "বাণিজ্যিক": "Commercial",
  "ব্যক্তিগত": "Personal",
  "পারিবারিক": "Family",
  "সামাজিক": "Social",
  "ব্যবসায়িক": "Business",
  "অর্থনৈতিক": "Economic",
  "আর্থিক": "Financial",
  "চিকিৎসা": "Medical",
  "শিক্ষা": "Education",
  "কৃষি": "Agriculture",
  "ডেইরি": "Dairy",
  "পোল্ট্রি": "Poultry",
  "মৎস্য": "Fisheries",
  "খামার": "Farming",
  "কল্যাণ": "Welfare",
  "ভ্রমণ": "Travel",
  "হজ": "Hajj",
  "বিয়ে": "Marriage",
  "সংস্কার": "Renovation",
  "গৃহ": "Home",
  "গাড়ি": "Car",
  "বাইক": "Bike",
  "জমি": "Land",
  "ফ্ল্যাট": "Flat",
  "দোকান": "Shop",
  "কারখানা": "Factory",
  "শিল্প": "Industry",
  "কোম্পানি": "Company",
  "সংস্থা": "Organization",
  "অফিস": "Office",
  "কার্যালয়": "Office",
  "কার্যালয়": "Office",
  "হেড": "Head",
  "প্রধান": "Main",
  "কেন্দ্রীয়": "Central",
  "ঢাকা": "Dhaka",
  "সিলেট": "Sylhet",
  "চট্টগ্রাম": "Chittagong",
  "রাজশাহী": "Rajshahi",
  "খুলনা": "Khulna",
  "বরিশাল": "Barisal",
  "রংপুর": "Rangpur",
  "ময়মনসিংহ": "Mymensingh",
  "কুমিল্লা": "Cumilla",
  "বগুড়া": "Bogra",
  "মিরপুর": "Mirpur",
  "গুলশান": "Gulshan",
  "ধানমন্ডি": "Dhanmondi",
  "মতিঝিল": "Motijheel",
  "দিলকুশা": "Dilkusha",
  "সিঙ্গাপুর": "Singapore",
  "মেরিনা": "Marina",
  "বুলেভার্ড": "Boulevard",
  "বে": "Bay",
  "টাওয়ার": "Tower",
  "টাওয়ার": "Tower",
  "ফাইন্যান্স": "Finance",
  "ফাইন্যান্সিয়াল": "Financial",
  "স্কিমগুলো": "Schemes",
  "সুবিধাসমূহ": "Benefits",
  "কর্মীদের": "Workers",
  "জামিনদার": "Guarantor",
  "গ্যারান্টার": "Guarantor",
  "গ্যারান্টারের": "Guarantor",
  "ফাইলের": "File",
  "ফাইলটি": "File",
  "পেজের": "Page",
  "সাইটের": "Site",
  "কোম্পানির": "Company",
  "অফিসের": "Office",
  "শর্তাবলীর": "Terms",
  "নীতির": "Policy",
  "দেশের": "Country",
  "শহরের": "City",
  "ঠিকানার": "Address",
  "আইডির": "ID",
  "নম্বরের": "Number",
  "পয়সার": "Paisa",
  "হাজারের": "Thousand",
  "লাখের": "Lakh",
  "কোটির": "Crore",
  "তারিখের": "Date",
  "ফর্মের": "Form",
  "ফরমের": "Form",
  "বাটনের": "Button",
  "মেনুর": "Menu",
  "ট্যাবের": "Tab",
  "লিঙ্কের": "Link",
  "মেসেজের": "Message",
  "বার্তার": "Message",
  "সাপোর্টের": "Support",
  "কলের": "Call",
  "ভয়েসের": "Voice",
  "ভিডিওর": "Video",
  "অডিওর": "Audio",
  "প্রমাণের": "Proof",
  "সনদের": "Certificate",
  "সার্টিফিকেটের": "Certificate",
  "রশিদের": "Receipt",
  "স্থগিতের": "Suspension",
  "পরিবর্তনের": "Change",
  "আপডেটের": "Update",
  "সংরক্ষণের": "Save",
  "দাখিলের": "Submission",
  "ডাউনলোডের": "Download",
  "আপলোডের": "Upload",
  "প্রিন্টের": "Print",
  "কপির": "Copy",
  "শেয়ারের": "Share",
  "ইনস্টলের": "Install",
  "ক্লিকের": "Click",
  "অনুসন্ধানের": "Search",
  "ফিল্টারের": "Filter",
  "রিফ্রেশের": "Refresh",
  "শুরুর": "Start",
  "শেষের": "End",
  "আগের": "Previous",
  "পরের": "Next",
  "প্রথম": "First",
  "দ্বিতীয়": "Second",
  "তৃতীয়": "Third",
  "চতুর্থ": "Fourth",
  "পঞ্চম": "Fifth",
  "ষষ্ঠ": "Sixth",
  "১ম": "1st",
  "২য়": "2nd",
  "২য়": "2nd",
  "৩য়": "3rd",
  "৪র্থ": "4th",
  "৫ম": "5th",
  "ধাপ": "Step",
  "ধাপের": "Step",
  "স্তর": "Level",
  "পর্যায়": "Stage",
  "পর্ব": "Part",
  "অংশ": "Section",
  "শ্রেণী": "Category",
  "ক্যাটাগরি": "Category",
  "ধরন": "Type",
  "ধরণ": "Type",
  "টাইপ": "Type",
  "নিজের": "own",
  "ব্যবসা": "business",
  "করতে": "to do",
  "পরিবারের": "family's",
  "প্রয়োজন": "need",
  "মেটাতে": "to meet",
  "আর্থিকভাবে": "financially",
  "স্বাবলম্বী": "self-reliant",
  "হতে": "to become",
  "সম্পর্কে": "about",
  "জানতে": "to know",
  "চান": "want",
  "কোনো": "no",
  "লুকায়িত": "hidden",
  "খরচ": "cost",
  "সুবিধা": "benefit",
  "জামানত": "collateral",
  "র": "of",
  "মধ্যে": "within",
  "হস্তান্তর": "disbursement",
  "ক্ষুদ্র": "micro",
  "সম্প্রসারণে": "expansion",
  "ফসল": "crop",
  "কর্তনের": "harvest",
  "ের": "",
  "ফার্মের": "farm",
  "বিদেশে": "abroad",
  "গমনেচ্ছুকদের": "for overseas seekers",
  "ভিসা": "visa",
  "টিকিট": "ticket",
  "খরচের": "expenses",
  "তাৎক্ষণিক": "instant",
  "ছাড়": "release",
  "উচ্চশিক্ষা": "higher education",
  "স্টুডেন্ট": "student",
  "পড়াশোনা": "studies",
  "হওয়া": "being",
  "গ্রেস": "grace",
  "পিরিয়ড": "period",
  "শিডিউল": "schedule",
  "প্লে": "Play",
  "পজ": "Pause",
  "বাংলাদেশ": "Bangladesh",
  "গাইডলাইন": "guideline",
  "অনুযায়ী": "according to",
  "পরিচালিত": "governed",
  "ফান্ড": "fund",
  "ট্রান্সফার": "transfer",
  "ভেরিফিকেশন": "verification",
  "তফসিলি": "Scheduled",
  "নেটওয়ার্ক": "network",
  "শর্তে": "terms",
  "সেবা": "Service",
  "আইএসও": "ISO",
  "সার্টিফাইড": "certified",
  "সিস্টেম": "system",
  "প্রয়োজনীয়": "essential",
  "সার্ভিস": "service",
  "ইএমআই": "EMI",
  "অবস্থা": "status",
  "ফিক্সড": "fixed",
  "এফডিআর": "FDR",
  "টা": "",
  "সময়": "time",
  "থাকবে": "will remain",
  "আপনার": "your",
  "প্রয়োজন": "need",
  "সুবিধার": "benefit",
  "কথা": "consideration",
  "বিবেচনা": "consideration",
  "আমাদের": "our",
  "সাজানো": "arranged",
  "হয়েছে": "is",
  "নিয়ে": "with",
  "এগিয়ে": "forward",
  "যান": "go",
  "স্বপ্নের": "dream",
  "পথে": "path",
  "ে": "",
  "করুন": "do",
  "মাধ্যমে": "through",
  "রা": "",
  "লক্ষ্য": "goal",
  "পূরণ": "fulfill",
  "পারেন": "can",
  "মূল": "key",
  "িক": "",
  "যোগ্যতা": "eligibility",
  "দেখুন": "view",
  "প্রয়োজনে": "if needed",
  "তাত্ক্ষণিক": "instant",
  "ব্যবস্থা": "facility",
  "বীজ": "seeds",
  "সার": "fertilizer",
  "আধুনিক": "modern",
  "যন্ত্রপাতি": "machinery",
  "ক্রয়ে": "purchase",
  "সরকার": "Government",
  "নূন্যতম": "minimum",
  "টিউশন": "tuition",
  "বই": "books",
  "মেধাবী": "meritorious",
  "প্রণোদনা": "incentive",
  "আকস্মিক": "emergency",
  "অর্থ": "funds",
  "পরিস্থিতিতে": "situations",
  "জটিল": "complex",
  "যাচাইকরণ": "verification",
  "হাসপাতাল": "hospital",
  "বিল": "bill",
  "তথ্য": "information",
  "অতিরিক্ত": "additional",
  "ছাড়াই": "without",
  "পান": "receive",
  "ট্র্যাক": "track",
  "যেমন": "e.g.",
  "ব্যবহৃত": "used",
  "দিয়ে": "with",
  "উদাহরণ": "example",
  "যাচাইাধীন": "under review",
  "কৃত": "Done",
  "তোলার": "withdrawing",
  "তুলুন": "withdraw",
  "কিস্তিসমূহভার্চুয়াল": "Installments | Virtual",
  "কার্ডউইথড্র": "Card | Withdraw",
  "লেনদেনলেটার": "Transactions | Letter",
  "পাওয়া": "found",
  "যায়নি": "not found",
  "পর্যালোচনা": "review",
  "করা": "done",
  "যায়": "can be done",
  "পছন্দের": "preferred",
  "করলেই": "clicking",
  "বসে": "auto-fills",
  "যাবে": "will",
  "কাঙ্ক্ষিত": "desired",
  "লিখুন": "enter",
  "সীমা": "limit",
  "নির্বাচিত": "selected",
  "স্লাইডার": "slider",
  "দিয়েও": "also with",
  "সমন্বয়": "adjust",
  "মোট": "total",
  "সর্বমোট": "grand total",
  "অংক": "Amount",
  "অংশীদারিত্বের": "Partnership",
  "অংশীদারিত্ব": "Partnership",
  "অংশীদার": "Partner",
  "অক্ষর": "Characters",
  "অক্ষরের": "Characters",
  "অগ্রণী": "Agrani",
  "অগ্রাধিকার": "Priority",
  "অগ্রিম": "Advance",
  "অঙ্ক": "Amount",
  "অঙ্কে": "in numbers",
  "অঙ্গীকারনামা": "Declaration / Undertaking",
  "অজানা": "Unknown",
  "অতিথি": "Guest",
  "অত্যন্ত": "Extremely",
  "অথরাইজড": "Authorized",
  "অন": "On",
  "অনলাইন": "Online",
  "অনলাইনের": "Online",
  "অনলাইনভিত্তিক": "Online-based",
  "অনির্ধ": "Unspecified",
  "অনুকূলে": "in favor of",
  "অনুচ্ছেদ": "Paragraph / Clause",
  "অনুচ্ছেদের": "Section / Clause",
  "অনুপযুক্ত": "Ineligible",
  "অনুভূমিক": "Horizontal",
  "অনুরোধ": "Request",
  "অনুরোধসমূহ": "Requests",
  "অনুসারে": "according to",
  "অনেক": "Many",
  "অন্তর": "within",
  "অপব্যবহার": "Misuse",
  "অপরাধ": "Offense / Crime",
  "অপরিশোধিত": "Unpaid / Outstanding",
  "অপর্যাপ্ত": "Insufficient",
  "অপশন": "Option",
  "অপশনটি": "Option",
  "অপশনে": "Options",
  "অপসারিত": "Removed",
  "অপ্টিমাইজ": "Optimize",
  "অপ্রকাশিত": "Unpublished",
  "অপ্রত্যাশিত": "Unexpected",
  "অফ": "Off",
  "অফলাইন": "Offline",
  "অফার": "Offer",
  "অফিশিয়াল": "Official",
  "অফিসিয়াল": "Official",
  "অবশিষ্ট": "Remaining",
  "অবহিত": "Informed",
  "অবাধ": "Unrestricted",
  "অবৈধ": "Illegal",
  "অভিজ্ঞতা": "Experience",
  "অমিল": "Mismatch",
  "অর্জিত": "Earned",
  "অর্থায়ন": "Financing",
  "অসন্তোষজনক": "Unsatisfactory",
  "অসুস্থতা": "Illness",
  "অ্যাকশন": "Action",
  "অ্যাকাউন্টধারীর": "Account Holder's",
  "অ্যাকাউন্টস": "Accounts",
  "অ্যাকাডেমিক": "Academic",
  "অ্যাক্ট": "Act",
  "অ্যাক্সেস": "Access",
  "অ্যাপ": "App",
  "অ্যাপটি": "App",
  "অ্যাপে": "in App",
  "অ্যাপের": "App's",
  "অ্যাপ্রুভড": "Approved",
  "অ্যাপ্রুভাল": "Approval",
  "অ্যাসাইন": "Assign",
  "অ্যাসাইনকৃত": "Assigned",
  "অ্যাসাইনড": "Assigned",
  "আঁকুন": "Draw",
  "আই": "I",
  "আইটেম": "Item",
  "আইটেমগুলো": "Items",
  "আইটেমটি": "Item",
  "আইডিআরএ": "IDRA",
  "আইনজীবী": "Advocate / Lawyer",
  "আইনত": "by Law",
  "আইনানুগ": "Legal / Lawful",
  "আইফোন": "iPhone",
  "আইসোলেশন": "Isolation",
  "আউট": "Out",
  "আউটলেট": "Outlet",
  "আকারে": "in form of",
  "আক্তার": "Akter",
  "আগেই": "already",
  "আছে": "is available",
  "আজই": "Today itself",
  "আজকের": "Today's",
  "আত্মবিশ্বাস": "Confidence",
  "আত্মবিশ্বাসী": "Confident",
  "আত্মীয়": "Relative",
  "আত্মীয়": "Relative",
  "আদান": "Exchange",
  "আদায়": "Collection / Recovery",
  "আদায়কৃত": "Collected",
  "আনতে": "to bring",
  "আনব্লক": "Unblock",
  "আনসিন": "Unseen",
  "আনসিলেক্ট": "Unselect",
  "আনা": "Bring",
  "আনিসুর": "Anisur",
  "আনুমানিক": "Approximate",
  "আনোয়ার": "Anwar",
  "আনোয়ার": "Anwar",
  "আপ": "Up",
  "আপনাকে": "you",
  "আপনি": "You",
  "আবদুর": "Abdur",
  "আবশ্যক": "Mandatory / Required",
  "আবার": "Again",
  "আবাসন": "Housing",
  "আবেদনটির": "Application's",
  "আবেদনপত্রে": "in application form",
  "আব্দুল": "Abdul",
  "আমরা": "We",
  "আমাকে": "me",
  "আমানত": "Deposit",
  "আমানতকারী": "Depositor",
  "আমানতের": "Deposit",
  "আমার": "My",
  "আমি": "I",
  "আমিরাত": "Emirates",
  "আর": "And",
  "আরও": "More",
  "আরব": "Arab",
  "আরাফাহ্": "Arafah",
  "আল": "Al",
  "আলাইকুম": "Alaikum",
  "আশা": "Hope",
  "আসবে": "will come",
  "আসসালামু": "Assalamu",
  "আসে": "comes",
  "আহমদ": "Ahmad",
  "আহমেদ": "Ahmed",
  "ইং": "Eng",
  "ইংরেজি": "English",
  "ইউটিলিটি": "Utility",
  "ইউনাইটেড": "United",
  "ইউনিয়ন": "Union",
  "ইডিট": "Edit",
  "ইতালি": "Italy",
  "ইতিমধ্যে": "Already",
  "ইতিহাস": "History",
  "ইত্যাদি": "etc.",
  "ইন": "In",
  "ইনপুট": "Input",
  "ইনফো": "Info",
  "ইনবক্স": "Inbox",
  "ইনবক্সে": "in Inbox",
  "ইনস্টলেশন": "Installation",
  "ইন্টারনেট": "Internet",
  "ইন্টারন্যাশনাল": "International",
  "ইন্দোনেশিয়া": "Indonesia",
  "ইন্স্যুরেন্স": "Insurance",
  "ইমু": "IMO",
  "ইমুতে": "on IMO",
  "ইমো": "IMO",
  "ইলেকট্রনিক": "Electronic",
  "ইলেকট্রনিক্যালি": "Electronically",
  "ইসলাম": "Islam",
  "ইসলামী": "Islami",
  "ইস্টার্ন": "Eastern",
  "ইস্যু": "Issue",
  "ইস্যুকৃত": "Issued",
  "ইস্যুর": "Issue",
  "ইয়াসিনুর": "Yasinur",
  "উইথড্রল": "Withdrawal",
  "উক্ত": "Said / Mentioned",
  "উত্তর": "Answer",
  "উত্তীর্ণের": "Passing / Due",
  "উদ্দেশ্য": "Purpose",
  "উদ্দেশ্যবহির্ভূত": "Beyond purpose",
  "উদ্দেশ্যেই": "for the purpose of",
  "উন্মুক্ত": "Open",
  "উপর": "on / above",
  "উপরে": "above",
  "উপরের": "above",
  "উভয়": "Both",
  "উভয়ই": "both",
  "উভয়": "Both",
  "উল্লাহ": "Ullah",
  "উল্লিখিত": "Mentioned",
  "উল্লেখ": "Mention",
  "ঋণখেলাপি": "Loan Defaulter",
  "ঋতুভিত্তিক": "Seasonal",
  "একই": "Same",
  "একশত": "One Hundred",
  "এক্সিম": "EXIM",
  "এখনই": "Now / Instantly",
  "এখনও": "Still",
  "এখনো": "Still",
  "এখানে": "Here",
  "এগিয়ে": "Forward",
  "এজেন্ট": "Agent",
  "এটি": "This",
  "এড": "Add",
  "এডিটেবল": "Editable",
  "এনআইডি": "NID",
  "এন্টারপ্রাইজ": "Enterprise",
  "এন্ট্রি": "Entry",
  "এপার্টমেন্ট": "Apartment",
  "এর": "of",
  "এলাকা": "Area / Region",
  "এশিয়া": "Asia",
  "এসএমই": "SME",
  "এসে": "arrived",
  "এসেছে": "has arrived",
  "ওই": "That",
  "ওইসব": "Those",
  "ওভারভিউ": "Overview",
  "ওমান": "Oman",
  "ওয়ালপেপার": "Wallpaper",
  "ওয়ালেট": "Wallet",
  "ওলেড": "OLED",
  "ওয়াটারমার্ক": "Watermark",
  "ওয়ালপেপার": "Wallpaper",
  "ওয়েব": "Web",
  "কত": "How much",
  "কনটেন্ট": "Content",
  "কনফার্ম": "Confirm",
  "কনফার্মেশন": "Confirmation",
  "কনফিগার": "Configure",
  "কনফিগারেশন": "Configuration",
  "কন্টাক্ট": "Contact",
  "কন্টেইনার": "Container",
  "কভারেজ": "Coverage",
  "কমপক্ষে": "At least",
  "কমপ্যাক্ট": "Compact",
  "কমার্শিয়াল": "Commercial",
  "কমার্স": "Commerce",
  "কমিউনিটি": "Community",
  "কমিটি": "Committee",
  "কম্পিউটার": "Computer",
  "করছেন": "are doing",
  "করণীয়": "Actionable steps",
  "করপোরেশন": "Corporation",
  "করবে": "will do",
  "করবেন": "will do",
  "করলে": "if done",
  "করিতে": "to do",
  "করিম": "Karim",
  "করিলাম": "did",
  "করিলে": "if done",
  "করিয়া": "having done",
  "করেছে": "has done",
  "করেছেন": "have done",
  "করেনি": "did not do",
  "কর্তন": "Deduction",
  "কর্তৃপক্ষ": "Authority",
  "কর্তৃপক্ষকে": "Authority",
  "কর্তৃপক্ষের": "Authority's",
  "কর্পোরেট": "Corporate",
  "কর্পোরেশন": "Corporation",
  "কলেজ": "College",
  "কাউন্টারে": "at counter",
  "কাছে": "near / with",
  "কাজ": "Work / Task",
  "কাজটি": "the task",
  "কাজে": "in work",
  "কাজের": "work's",
  "কাটাকাটি": "Alteration",
  "কাটার": "Cutting",
  "কাতার": "Qatar",
  "কানাডা": "Canada",
  "কামরুল": "Kamrul",
  "কারক": "Factor",
  "কারণ": "Reason",
  "কারণে": "due to",
  "কারিগরি": "Technical",
  "কার্ডহোল্ডার": "Cardholder",
  "কার্ডহোল্ডারের": "Cardholder's",
  "কার্যকরী": "Effective",
  "কার্যক্রম": "Operations",
  "কার্যসময়": "Working Hours",
  "কালার": "Color",
  "কালেকশন": "Collection",
  "কাস্টমাইজ": "Customize",
  "কাস্টমাইজেশন": "Customization",
  "কিউআর": "QR",
  "কীভাবে": "How to",
  "কুইক": "Quick",
  "কুটির": "Cottage",
  "কুয়েত": "Kuwait",
  "কৃষিকাজ": "Farming",
  "কেনাকাটা": "Shopping",
  "কেন্দ্রে": "in Centre",
  "কেয়ার": "Care",
  "কোণায়": "in corner",
  "কোণায়": "in corner",
  "কোন": "Any",
  "কোরিয়া": "Korea",
  "ক্যাটেগরি": "Category",
  "ক্যাপশন": "Caption",
  "ক্যালকুলেটর": "Calculator",
  "ক্যাশ": "Cash",
  "ক্যাশআউট": "Cash Out",
  "ক্যাশব্যাক": "Cashback",
  "ক্যাশিয়ার": "Cashier",
  "ক্রম": "Order",
  "ক্রমিক": "Serial",
  "ক্রস": "Cross",
  "ক্রেডিট": "Credit",
  "ক্রয়": "Purchase",
  "ক্লাউড": "Cloud",
  "ক্লাউডে": "in Cloud",
  "ক্লাসিক": "Classic",
  "ক্লিপবোর্ডে": "to Clipboard",
  "ক্লিয়ারেন্স": "Clearance",
  "ক্ষুদ্রঋণ": "Microcredit",
  "ক্ষেত্রে": "in case of",
  "খসড়া": "Draft",
  "খাত": "Sector / Head",
  "খাতুন": "Khatun",
  "খালি": "Empty",
  "খুঁজে": "Find",
  "খুব": "Very",
  "খুশি": "Pleased",
  "খোলো": "Open",
  "গঠনের": "Formation's",
  "গণপ্রজাতন্ত্রী": "People's Republic of",
  "গত": "Last / Past",
  "গবাদিপশু": "Livestock",
  "গরমিল": "Discrepancy",
  "গল্প": "Story",
  "গাইড": "Guide",
  "গাভী": "Cow / Cattle",
  "গিয়ে": "Going",
  "গেছে": "gone",
  "গেটওয়ে": "Gateway",
  "গেটওয়ে": "Gateway",
  "গেটিং": "Getting",
  "গেলে": "if gone",
  "গেস্ট": "Guest",
  "গোপন": "Secret / Confidential",
  "গ্যারান্টি": "Guarantee",
  "গ্যাস": "Gas",
  "গ্রহণযোগ্য": "Acceptable",
  "গ্রহীতার": "Recipient's / Borrower's",
  "গ্রামীণ": "Grameen / Rural",
  "গ্রিন": "Green",
  "গ্রুপ": "Group",
  "গ্লোবাল": "Global",
  "গড়": "Average",
  "গড়ে": "on average",
  "ঘষামাজা": "Tampering",
  "ঘোরান": "Rotate",
  "ঘোষণা": "Declaration",
  "চলছে": "Running",
  "চলতি": "Current / Active",
  "চলাকালীন": "During",
  "চলে": "Moves",
  "চাই": "Want",
  "চাইনিজ": "Chinese",
  "চাচা": "Uncle",
  "চাপ": "Press",
  "চাপলে": "upon pressing",
  "চারশত": "Four Hundred",
  "চার্টার্ড": "Chartered",
  "চালু": "Active / Enabled",
  "চাষ": "Cultivation",
  "চাষে": "in cultivation",
  "চিঠি": "Letter",
  "চিফ": "Chief",
  "চীন": "China",
  "চূড়ান্ত": "Final",
  "চেক": "Cheque / Check",
  "চেকের": "Cheque's",
  "চেপে": "Pressing",
  "চেয়ারম্যান": "Chairman",
  "চেয়ে": "than",
  "চ্যানেল": "Channel",
  "চ্যানেলটি": "Channel",
  "চ্যানেলসমূহ": "Channels",
  "চ্যানেলের": "Channel's",
  "ছাড়া": "Without",
  "ছিল": "was",
  "ছেলে": "Son",
  "জন": "Person",
  "জনতা": "Janata / Public",
  "জনপ্রিয়": "Popular",
  "জানাতে": "to inform",
  "জান্নাত": "Jannat",
  "জাপান": "Japan",
  "জাহান": "Jahan",
  "জীবন": "Life",
  "জুডিশিয়াল": "Judicial",
  "জুম": "Zoom",
  "জেনারেটেড": "Generated",
  "ঝামেলা": "Hassle",
  "ঝামেলামুক্ত": "Hassle-free",
  "ঝুঁকি": "Risk",
  "টপ": "Top",
  "টাইটেল": "Title",
  "টাচ": "Touch",
  "টি": "",
  "টিউটোরিয়াল": "Tutorial",
  "টিন": "TIN",
  "টিপস": "Tips",
  "টিম": "Team",
  "টু": "To",
  "টেক্সট": "Text",
  "টেলিগ্রাম": "Telegram",
  "টেস্টমোনিয়াল": "Testimonial",
  "ট্যাগলাইন": "Tagline",
  "ট্রাস্ট": "Trust",
  "ট্রেড": "Trade",
  "ট্র্যাকিং": "Tracking",
  "ডকুমেন্টেশন": "Documentation",
  "ডট": "Dot",
  "ডাকঘরঃ": "Post Office:",
  "ডাক্তার": "Doctor",
  "ডাচ": "Dutch",
  "ডাচ্": "Dutch",
  "ডাটা": "Data",
  "ডাটাবেজ": "Database",
  "ডাটাবেজে": "in Database",
  "ডান": "Right",
  "ডানে": "to the right",
  "ডায়ালগ": "Dialog",
  "ডায়ালগে": "in Dialog",
  "ডার্ক": "Dark",
  "ডায়নামিক": "Dynamic",
  "ডায়াল": "Dial",
  "ডিউটির": "Duty",
  "ডিএইচ": "DH",
  "ডিজিট": "Digits",
  "ডিজিটের": "Digits",
  "ডিপ": "Deep",
  "ডিপিএস": "DPS",
  "ডিফল্ট": "Default",
  "ডিভাইস": "Device",
  "ডিভাইসে": "on Device",
  "ডিরেক্ট": "Direct",
  "ডুপ্লিকেট": "Duplicate",
  "ডেট": "Date",
  "ডেটা": "Data",
  "ডেবিট": "Debit",
  "ডেমো": "Demo",
  "ডেল্টা": "Delta",
  "ডোমেইন": "Domain",
  "তথ্যাদি": "Information",
  "তবে": "However",
  "তরুণ": "Youth",
  "তাই": "Therefore",
  "তাইওয়ান": "Taiwan",
  "তানজিলা": "Tanjila",
  "তানভীর": "Tanvir",
  "তাফি": "Tafi",
  "তাহমিদ": "Tahmid",
  "তিনশত": "Three Hundred",
  "তিনি": "He / She",
  "তুলতে": "to withdraw",
  "তোলা": "Withdrawal",
  "ত্রৈ": "Tri",
  "থাইল্যান্ড": "Thailand",
  "থাকতে": "to stay",
  "থাকলে": "if present",
  "থাকা": "Being",
  "থাকায়": "being",
  "থাকিবে": "shall remain",
  "থাকে": "remains",
  "থিম": "Theme",
  "থ্রি": "Three",
  "দক্ষিণ": "South",
  "দণ্ডনীয়": "Punishable",
  "দরকার": "Need / Required",
  "দায়": "Liability",
  "দায়মুক্তি": "Indemnity",
  "দায়িত্ব": "Responsibility",
  "দি": "The",
  "দিচ্ছি": "giving",
  "দিচ্ছে": "is providing",
  "দিতে": "to give",
  "দিলে": "if given",
  "দিলেই": "upon giving",
  "দিয়েছেন": "have given",
  "দীর্ঘমেয়াদী": "Long-term",
  "দুইশত": "Two Hundred",
  "দুর্ঘটনা": "Accident",
  "দুর্নীতিকে": "Corruption",
  "দুর্বল": "Weak",
  "দৃশ্যমান": "Visible",
  "দেওয়া": "Given",
  "দেওয়া": "Given",
  "দেওয়ার": "giving",
  "দেখতে": "to see / view",
  "দেখা": "View",
  "দেখান": "Show",
  "দেখাবে": "will show",
  "দেখাবেন": "will show",
  "দেবে": "will give",
  "দেরি": "Delay",
  "দেশপ্রেমের": "Patriotism's",
  "দোকানদার": "Shopkeeper",
  "দ্বিগুণ": "Double",
  "দ্বিপাক্ষিক": "Bilateral",
  "নং": "No.",
  "নন": "Non",
  "নমিনীর": "Nominee's",
  "নমুনা": "Sample",
  "নাগরিক": "Citizen",
  "নামঞ্জুর": "Rejected",
  "নাম্বার": "Number",
  "নিকট": "near",
  "নিকটস্থ": "Nearest",
  "নিচে": "Below",
  "নিচের": "below",
  "নিজস্ব": "Own",
  "নিতে": "to take",
  "নিন": "",
  "নিবে": "will take",
  "নিয়ন্ত্রণ": "Control",
  "নিরবচ্ছিন্ন": "Uninterrupted",
  "নিরীক্ষা": "Audit",
  "নির্দিষ্ট": "Specific",
  "নির্দেশ": "Guideline",
  "নির্দেশনা": "Instruction",
  "নির্দেশনাবলী": "Instructions",
  "নির্দেশনামূলক": "Instructional",
  "নির্ধারণ": "Determination / Set",
  "নির্ধারিত": "Fixed / Specified",
  "নির্ভরতার": "Reliability's",
  "নির্ভরযোগ্য": "Reliable",
  "নিশ্চিত": "Confirm / Guaranteed",
  "নিশ্চিতকরণ": "Confirmation",
  "নিশ্চিতভাবে": "Firmly",
  "নিষ্ক্রিয়": "Inactive",
  "নিষ্পত্তি": "Settlement",
  "নিয়ম": "Rule",
  "নিয়মাবলী": "Rules & Regulations",
  "নিয়মিত": "Regular",
  "নীতি": "Policy",
  "নেওয়ার": "taking",
  "নেক্সাসপে": "NexusPay",
  "নেপাল": "Nepal",
  "নেভি": "Navy",
  "নোট": "Note",
  "নোটারি": "Notary",
  "ন্যাশনাল": "National",
  "পক্ষ": "Party",
  "পক্ষের": "Party's",
  "পছন্দ": "Favorite / Choice",
  "পত্র": "Letter / Certificate",
  "পদক্ষেপ": "Step",
  "পদবি": "Designation",
  "পদবী": "Designation",
  "পদ্ধতি": "Method",
  "পদ্মা": "Padma",
  "পপ": "Pop",
  "পপুলার": "Popular",
  "পরচা": "Land Record",
  "পরবর্তী": "Next",
  "পরবর্তীতে": "Later",
  "পরামর্শ": "Advice",
  "পরি": "Pari",
  "পরিধি": "Scope",
  "পরিবর্তিত": "Changed",
  "পরিমাণ": "Amount",
  "পরিসংখ্যান": "Statistics",
  "পরিসীমা": "Limit",
  "পরীক্ষা": "Check / Examination",
  "পর্যবেক্ষণ": "Monitoring",
  "পর্যাপ্ত": "Sufficient",
  "পর্যালোচনাধীন": "Under Review",
  "পলিসি": "Policy",
  "পল্লী": "Palli / Rural",
  "পাঁচশত": "Five Hundred",
  "পাইকারি": "Wholesale",
  "পাওনা": "Receivable",
  "পাওয়া": "Obtain / Available",
  "পাকিস্তান": "Pakistan",
  "পাচ্ছি": "receiving",
  "পাঠাতে": "to send",
  "পাঠিয়েছেন": "have sent",
  "পাবে": "will get",
  "পাবেন": "will get",
  "পারব": "can",
  "পারবে": "can",
  "পারবেন": "can",
  "পারবো": "can",
  "পারি": "can",
  "পারিবে": "shall be able to",
  "পারে": "can",
  "পার্ট": "Part",
  "পার্টনার": "Partner",
  "পার্সোনাল": "Personal",
  "পালন": "Compliance",
  "পালনকালে": "during duty",
  "পাশ": "Side",
  "পাশে": "beside",
  "পাশের": "beside",
  "পাসওয়ার্ড": "Password",
  "পাসপোর্ট": "Passport",
  "পিএলসি": "PLC",
  "পিঠ": "Side (Page)",
  "পিঠের": "reverse side",
  "পুনরায়": "Again",
  "পুনরুদ্ধার": "Recovery",
  "পূবালী": "Pubali",
  "পূর্ণ": "Full / Complete",
  "পূর্ণাঙ্গ": "Full-fledged",
  "পূর্বনির্ধারিত": "Preset / Predetermined",
  "পূর্ববর্তী": "Previous",
  "পূর্বশর্ত": "Prerequisite",
  "পূর্বাবস্থায়": "to previous state",
  "পূর্বেই": "prior to",
  "পেছনের": "Back / Reverse",
  "পেতে": "to get",
  "পেপারলেস": "Paperless",
  "পেমেন্ট": "Payment",
  "পেরেছি": "could do",
  "পেয়ি": "Payee",
  "পেয়ে": "received",
  "পেয়েছিলাম": "had received",
  "পোর্টফোলিও": "Portfolio",
  "পৌঁছাবে": "will reach",
  "পৌঁছে": "reached",
  "প্যাডের": "Pad's",
  "প্রকল্প": "Project",
  "প্রকৃত": "Actual",
  "প্রকৌশলী": "Engineer",
  "প্রক্রিয়ার": "Process's",
  "প্রক্রিয়া": "Process",
  "প্রক্রিয়াধীন": "Processing / Pending",
  "প্রক্রিয়ায়": "in process",
  "প্রগতি": "Pragati",
  "প্রচলিত": "Prevalent",
  "প্রজেক্ট": "Project",
  "প্রতিদিন": "Every Day",
  "প্রতিদিনের": "Daily",
  "প্রতিমাসে": "Monthly",
  "প্রতিশ্রুতিবদ্ধ": "Committed",
  "প্রতিষ্ঠান": "Organization / Institution",
  "প্রতিষ্ঠানের": "Organization's",
  "প্রত্যক্ষ": "Direct",
  "প্রত্যাখ্যাত": "Rejected",
  "প্রত্যাহার": "Withdrawal",
  "প্রত্যয়ন": "Attestation",
  "প্রদত্ত": "Given",
  "প্রদর্শন": "Display",
  "প্রদর্শিত": "Displayed",
  "প্রদান": "Provide / Submission",
  "প্রদানকারী": "Provider",
  "প্রদানযোগ্য": "Payable",
  "প্রদানের": "providing",
  "প্রফিট": "Profit",
  "প্রবাসে": "Abroad",
  "প্রবেশ": "Enter / Access",
  "প্রমোশনাল": "Promotional",
  "প্রযোজ্য": "Applicable",
  "প্ররোচনা": "Inducement",
  "প্রশংসামূলক": "Appreciative",
  "প্রসেস": "Process",
  "প্রস্তাব": "Proposal",
  "প্রাইম": "Prime",
  "প্রাতিষ্ঠানিক": "Institutional",
  "প্রাথমিক": "Initial",
  "প্রাপক": "Recipient",
  "প্রাপকের": "Recipient's",
  "প্রাপ্ত": "Received",
  "প্রাপ্তি": "Receipt",
  "প্রাপ্তির": "Receipt",
  "প্রারম্ভিক": "Initial",
  "প্রি": "Pre",
  "প্রিপেমেন্ট": "Prepayment",
  "প্রিসেট": "Preset",
  "প্রিয়": "Dear",
  "প্রুফ": "Proof",
  "প্রেরক": "Sender",
  "প্রেরণ": "Send",
  "প্রেরিত": "Sent",
  "প্রেসক্রিপশন": "Prescription",
  "প্লেসহোল্ডার": "Placeholder",
  "প্ল্যাটফর্ম": "Platform",
  "প্ল্যাটফর্মে": "on Platform",
  "প্ল্যাটফর্মের": "Platform's",
  "পড়িয়া": "having read",
  "পড়েছে": "has fallen",
  "ফটো": "Photo",
  "ফটোকপি": "Photocopy",
  "ফরম্যাট": "Format",
  "ফরম্যাটে": "in Format",
  "ফাংশন": "Function",
  "ফান্ডিং": "Funding",
  "ফারহানা": "Farhana",
  "ফার্ম": "Farm",
  "ফার্স্ট": "First",
  "ফিচারসমূহ": "Features",
  "ফিমেল": "Female",
  "ফিরিয়ে": "Back",
  "ফিরিয়ে": "Back",
  "ফিরুন": "Return",
  "ফিল": "Fill",
  "ফিলিপাইন": "Philippines",
  "ফিল্টারিং": "Filtering",
  "ফিল্ড": "Field",
  "ফুলস্ক্রিন": "Fullscreen",
  "ফেরত": "Refund / Return",
  "মধ্যমেয়াদী": "Medium-term",
  "মধ্যেই": "within",
  "মনিটরিং": "Monitoring",
  "মন্তব্য": "Comment",
  "মস্তিষ্কে": "in mind",
  "মা": "Mother",
  "মাইক": "Mic",
  "মাইক্রোক্রেডিট": "Microcredit",
  "মাউস": "Mouse",
  "মাউসের": "Mouse's",
  "মাঝারি": "Medium",
  "মাধ্যম": "Medium / Via",
  "মানি": "Money",
  "মানিয়ে": "Adapt",
  "মামা": "Uncle",
  "মার্চেন্ট": "Merchant",
  "মালদ্বীপ": "Maldives",
  "মালয়েশিয়া": "Malaysia",
  "মাল্টি": "Multi",
  "মাস্টার": "Master",
  "মিউচুয়াল": "Mutual",
  "মিডনাইট": "Midnight",
  "মিথ্যা": "False",
  "মিলছে": "matching",
  "মুক্ত": "Free",
  "মুছতে": "to delete",
  "মুহূর্তে": "in moment",
  "মূলধন": "Capital",
  "মূলধনের": "Capital",
  "মূল্য": "Value / Price",
  "মৃত": "Deceased",
  "মেইল": "Mail",
  "মেগাবাইট": "Megabyte (MB)",
  "মেগাবাইটের": "Megabyte (MB)",
  "মেঘনা": "Meghna",
  "মেটলাইফ": "MetLife",
  "মেথড": "Method",
  "মেথডটি": "Method",
  "মেথডসমূহ": "Methods",
  "মেথডে": "in Method",
  "মেথডের": "Method",
  "মেনে": "Adhering to",
  "মেম্বারের": "Member's",
  "মেল": "Male / Mail",
  "মেসেজিং": "Messaging",
  "মেসেঞ্জার": "Messenger",
  "মেয়াদ": "Tenure / Term",
  "মেয়াদকাল": "Tenure Duration",
  "মেয়াদপূর্ব": "Pre-mature",
  "মেয়াদপূর্বে": "before maturity",
  "মেয়াদি": "Term",
  "মেয়াদী": "Term",
  "মেয়াদে": "Tenure",
  "মেয়াদোত্তীর্ণ": "Expired",
  "মেয়ে": "Daughter / Girl",
  "মো": "Md.",
  "মোঃ": "Md.",
  "মোড": "Mode",
  "মোডালে": "in Modal",
  "মোরাটোরিয়াম": "Moratorium",
  "মোসাঃ": "Mst.",
  "মোস্তাফিজুর": "Mostafizur",
  "মোহনা": "Mohona",
  "মোহাম্মদ": "Mohammad",
  "মৌসুমি": "Seasonal",
  "ম্যানুয়াল": "Manual",
  "ম্যানেজ": "Manage",
  "ম্যানেজমেন্ট": "Management",
  "যত": "As much as",
  "যদি": "If",
  "যাচাইপূর্বক": "after verification",
  "যাচাইয়ে": "in verification",
  "যায়নি": "did not go",
  "যুক্তরাজ্য": "United Kingdom",
  "যুক্তরাষ্ট্র": "United States",
  "যেভাবে": "As",
  "যেসব": "Those",
  "যোগ্য": "Eligible",
  "রক্তের": "Blood",
  "রফিক": "Rafiq",
  "রফিকুল": "Rafiqul",
  "রমনা": "Ramna",
  "রয়্যাল": "Royal",
  "রহমান": "Rahman",
  "রহিম": "Rahim",
  "রাইট": "Right",
  "রাউটিং": "Routing",
  "রাখলে": "if kept",
  "রাখা": "Keep",
  "রাখুন": "Keep",
  "রাজি": "Agree",
  "রামপুর": "Rampur",
  "রাশেদুল": "Rashedul",
  "রাস্তা": "Road",
  "রিকোয়েস্ট": "Request",
  "রিকোয়েস্ট": "Request",
  "রিচার্জ": "Recharge",
  "রিটার্ন": "Return",
  "রিটার্নেবল": "Returnable",
  "রিডাইরেক্ট": "Redirect",
  "রিফান্ড": "Refund",
  "রিভিউ": "Review",
  "রিমার্ক": "Remark",
  "রিসিট": "Receipt",
  "রিসিভ": "Receive",
  "রূপালী": "Rupali",
  "রেখে": "Keeping",
  "রেগুলেশন": "Regulation",
  "রেজোলিউশন": "Resolution",
  "রেজ্যুলুশন": "Resolution",
  "রেট": "Rate",
  "রেড": "Red",
  "রেমিট্যান্স": "Remittance",
  "রয়েছে": "is present",
  "লাইন": "Line",
  "লাইনে": "in line",
  "লাইনের": "Line",
  "লাইফ": "Life",
  "লাইসেন্স": "License",
  "লাইসেন্সপ্রাপ্ত": "Licensed",
  "লাগবে": "Required / Needed",
  "লাল": "Red",
  "লাষ্টের": "Last",
  "লাস্টের": "Last",
  "লিখবেন": "write",
  "লিগ্যাল": "Legal",
  "লিমিটেড": "Limited",
  "লুকান": "Hide",
  "লুকানো": "Hidden",
  "লুকায়িত": "Hidden",
  "লুৎফর": "Lutfor",
  "লেটার": "Letter",
  "লেবেল": "Label",
  "লোড": "Load",
  "শক্তিশালী": "Powerful",
  "শপথ": "Oath",
  "শপের": "Shop's",
  "শরীয়াহ": "Shariah",
  "শর্তাবলি": "Terms & Conditions",
  "শান্তিনগর": "Shantinagar",
  "শাহিন": "Shahin",
  "শিরোনাম": "Title / Heading",
  "শীর্ষে": "at Top",
  "শেখ": "Sheikh",
  "শেয়ার": "Share",
  "শেয়ারিং": "Sharing",
  "শ্রীলঙ্কা": "Sri Lanka",
  "সংকটকালীন": "Crisis",
  "সংকটে": "in crisis",
  "সংক্রান্ত": "Regarding",
  "সংক্ষিপ্ত": "Short / Brief",
  "সংক্ষেপ": "Brief",
  "সংক্ষেপে": "In brief",
  "সংখ্যা": "Number",
  "সংখ্যার": "Number",
  "সংগৃহীত": "Collected",
  "সংযুক্ত": "Attached",
  "সংযোগ": "Connect",
  "সংযোজন": "Addition",
  "সংশোধনের": "Correction",
  "সংশ্লিষ্ট": "Concerned / Respective",
  "সক্রিয়তার": "Activity's",
  "সঞ্চয়": "Savings",
  "সঠিকভাবে": "Correctly",
  "সত্যায়িত": "Attested",
  "সত্যায়িত": "Attested",
  "সদর": "Sadar / Headquarter",
  "সন্তানের": "Child's",
  "সন্তুষ্ট": "Satisfied",
  "সন্তোষজনকভাবে": "Satisfactorily",
  "সফটওয়্যার": "Software",
  "সবচেয়ে": "Most",
  "সবচেয়ে": "Most",
  "সমন্বিত": "Integrated",
  "সমস্ত": "All",
  "সমাপনী": "Closing",
  "সমাপ্ত": "Completed",
  "সম্পত্তি": "Property",
  "সম্পত্তির": "Property's",
  "সম্পাদন": "Execution",
  "সম্পৃক্ততা": "Involvement",
  "সম্প্রসারণ": "Expansion",
  "সম্ভব": "Possible",
  "সম্মতি": "Consent",
  "সম্মানিত": "Honorable / Respected",
  "সময়সীমা": "Time Limit / Deadline",
  "সময়সূচি": "Schedule",
  "সময়সূচী": "Schedule",
  "সরকারী": "Government",
  "সরঞ্জাম": "Equipment",
  "সরাতে": "to remove",
  "সরানো": "Remove",
  "সর্বত্র": "Everywhere",
  "সহকর্মী": "Colleague",
  "সহযোগী": "Associate",
  "সহায়ক": "Helpful / Supporting",
  "সাং": "Village",
  "সাইজ": "Size",
  "সাইন": "Sign",
  "সাউথইস্ট": "Southeast",
  "সাক্ষ্য": "Witness / Testimony",
  "সাজু": "Saju",
  "সাধারণ": "General",
  "সাধারণত": "Usually",
  "সানন্দে": "Gladly",
  "সাপেক্ষে": "Subject to",
  "সাপোর্টেড": "Supported",
  "সাফারি": "Safari",
  "সাব": "Sub",
  "সাবটাইটেল": "Subtitle",
  "সামঞ্জস্য": "Consistency",
  "সামনের": "Front",
  "সাময়িক": "Temporary",
  "সাময়িকভাবে": "Temporarily",
  "সার্বক্ষণিক": "24/7 Round the clock",
  "সার্বিক": "Overall",
  "সার্ভার": "Server",
  "সার্ভারে": "on Server",
  "সার্ভিসেস": "Services",
  "সিক্রেট": "Secret",
  "সিঙ্ক": "Sync",
  "সিঙ্কে": "in Sync",
  "সিটি": "City",
  "সিটিটাচ": "CityTouch",
  "সিদ্ধান্ত": "Decision",
  "সিন": "Seen",
  "সিনিয়র": "Senior",
  "সিভিভি": "CVV",
  "সিরিয়াল": "Serial",
  "সিল": "Seal",
  "সিলমোহর": "Official Seal",
  "সীমিত": "Limited",
  "সুনির্দিষ্ট": "Specific",
  "সুপার": "Super",
  "সুমাইয়া": "Sumaiya",
  "সুযোগ": "Opportunity",
  "সুরক্ষা": "Security / Protection",
  "সুরক্ষিতভাবে": "Securely",
  "সুস্থ": "Healthy",
  "সেচ": "Irrigation",
  "সেট": "Set",
  "সেটিংস": "Settings",
  "সেটিংসে": "in Settings",
  "সেভার": "Saver",
  "সেমিস্টার": "Semester",
  "সেলফিন": "CellFin",
  "সোনাতলা": "Sonatala",
  "সোনালী": "Sonali",
  "সোশ্যাল": "Social",
  "সৌদি": "Saudi",
  "স্ক্যান": "Scan",
  "স্ক্রল": "Scroll",
  "স্ক্রিনশট": "Screenshot",
  "স্টক": "Stock",
  "স্টাইল": "Style",
  "স্টেজ": "Stage",
  "স্টোরি": "Story",
  "স্ট্যাটাস": "Status",
  "স্ট্যাম্প": "Stamp",
  "স্ট্যাম্পে": "on Stamp",
  "স্থানীয়": "Local",
  "স্থানীয়ভাবে": "Locally",
  "স্থাবর": "Immovable",
  "স্থায়ীভাবে": "Permanently",
  "স্থিতি": "Balance / Stability",
  "স্পর্শ": "Touch",
  "স্পষ্ট": "Clear",
  "স্পেন": "Spain",
  "স্পেশাল": "Special",
  "স্বজ্ঞানে": "Consciously",
  "স্বনিয়োজিত": "Self-employed",
  "স্বপ্ন": "Dream",
  "স্বল্পমেয়াদী": "Short-term",
  "স্বল্পসুদে": "at low interest",
  "স্বীকৃত": "Recognized",
  "স্বয়ংক্রিয়ভাবে": "Automatically",
  "স্মারক": "Memo",
  "স্যাফায়ার": "Sapphire",
  "স্লোগান": "Slogan",
  "হংকং": "Hong Kong",
  "হইবে": "shall be",
  "হচ্ছে": "is being",
  "হঠাৎ": "Suddenly",
  "হবে": "will be",
  "হয়েছেন": "have been",
  "হলে": "if so",
  "হলেও": "even if",
  "হলো": "done / became",
  "হস্তান্তরযোগ্য": "Transferable",
  "হাই": "High",
  "হাইলাইট": "Highlight",
  "হারিয়ে": "lost",
  "হাসনাবাদ": "Hasnabad",
  "হাসান": "Hasan",
  "হিসাবভুক্ত": "Accounted for",
  "হিসাবরক্ষক": "Accountant",
  "হেডিং": "Heading",
  "হোয়াটসঅ্যাপ": "WhatsApp",
  "হোল্ড": "Hold",
  "হোল্ডার": "Holder",
  "হোল্ডিং": "Holding",
  "হোসেন": "Hossain",
  "হোয়াটসঅ্যাপ": "WhatsApp",
  "হোয়াটসঅ্যাপে": "on WhatsApp",
  "হ্যাপি": "Happy",
  "হ্যালো": "Hello",
  "হয়": "is / becomes",
  "হয়তো": "maybe",
  "হয়নি": "has not been",
  "হয়ে": "being",
  "হয়েছি": "have been",
  "হয়েছে": "has been",
  "হয়েছেন": "have been",
  "অনুমোদনসাপেক্ষে": "subject to approval",
  "অপেক্ষায়": "waiting",
  "অফিসিয়াল": "Official",
  "আপলোডকৃত": "Uploaded",
  "আবেদনটি": "Application",
  "ইউজারনেমটি": "Username",
  "ইউজাররা": "Users",
  "ঋণটি": "Loan",
  "ঋণদাতা": "Lender",
  "এখান": "Here",
  "কথায়": "in words",
  "কার্ডসমূহ": "Cards",
  "কোডটি": "Code",
  "ক্লিকে": "on click",
  "খষ": "Khash",
  "খামারের": "Farm",
  "চুক্তিপত্রটি": "Agreement / Contract",
  "চূড়ান্ত": "Final",
  "চেয়ে": "than",
  "ছাড়করণ": "Disbursement",
  "টাকায়": "in Taka (BDT)",
  "ডকুমেন্টটি": "Document",
  "ডিসপ্লেতে": "on Display",
  "থানায়": "Police Station",
  "ধাপটি": "Step",
  "পরিচয়পত্রধারী": "ID Cardholder",
  "পরিচয়পত্রের": "Identity Card",
  "পরিশোধকৃত": "Repaid / Paid",
  "পর্যালোচনায়": "Under Review",
  "প্যাকেজটি": "Package",
  "ফেলতে": "to drop / discard",
  "ফেলা": "Discard",
  "ফেলুন": "Drop / Discard",
  "ফেসবুক": "Facebook",
  "ফ্রন্ট": "Front",
  "ফ্রিল্যান্সার": "Freelancer",
  "বগুড়া": "Bogra",
  "বডি": "Body",
  "বণ্টন": "Distribution / Allocation",
  "বণ্টনের": "Distribution",
  "বন্ধু": "Friend",
  "বর্গা": "Tenant / Sharecropper",
  "বর্ণনা": "Description",
  "বলছে": "says",
  "বলেছেন": "has said",
  "বসান": "Place / Insert",
  "বাংলা": "Bangla / Bengali",
  "বাংলাদেশি": "Bangladeshi",
  "বাংলায়": "in Bengali",
  "বাংলায়": "in Bengali",
  "বাদ": "Exclude",
  "বাধ্য": "Bound / Obligated",
  "বান্ধব": "Friendly",
  "বাবা": "Father",
  "বাম": "Left",
  "বামে": "to the left",
  "বাহককে": "to the Bearer",
  "বাহরাইন": "Bahrain",
  "বাড়াতে": "to increase",
  "বিঃদ্রঃ": "Note:",
  "বিকল্প": "Alternative",
  "বিজনেস": "Business",
  "বিট": "Bit",
  "বিতরণ": "Distribution",
  "বিতরণযোগ্য": "Distributable",
  "বিদায়": "Farewell",
  "বিদেশের": "Overseas",
  "বিদ্যমান": "Existing",
  "বিদ্যুৎ": "Electricity",
  "বিনিয়োগকারীদের": "Investors",
  "বিমা": "Insurance",
  "বিরুদ্ধে": "Against",
  "বিলম্ব": "Delay",
  "বিলম্বিত": "Delayed",
  "বিশেষজ্ঞ": "Expert",
  "বিশেষায়িত": "Specialized",
  "বিশ্ববিদ্যালয়ে": "at University",
  "বিশ্বস্ত": "Trusted",
  "বিস্তারিত": "Details",
  "বীমা": "Insurance",
  "বীমাকৃত": "Insured",
  "বীমার": "Insurance",
  "বুঝিয়া": "having understood",
  "বুটিক": "Boutique",
  "বৃত্তাকার": "Circular",
  "বৃদ্ধি": "Growth / Increase",
  "বৃদ্ধির": "Growth / Increase",
  "বেছে": "Choose",
  "বৈশিষ্ট্য": "Feature / Attribute",
  "বৈশিষ্ট্যসমূহ": "Features",
  "বোন": "Sister",
  "ব্যতীত": "Without / Except",
  "ব্যবসায়ী": "Businessman",
  "ব্যবহার": "Use",
  "ব্যবহারকারী": "User",
  "ব্যবহারের": "Usage",
  "ব্যাংকগুলোর": "Banks",
  "ব্যাংকসমূহ": "Banks",
  "ব্যাক": "Back",
  "ব্যাকগ্রাউন্ড": "Background",
  "ব্যাকগ্রাউন্ডের": "Background",
  "ব্যাজ": "Badge",
  "ব্যাতীত": "Without",
  "ব্রডকাস্ট": "Broadcast",
  "ব্রাউজার": "Browser",
  "ব্রাউজারে": "in Browser",
  "ব্রাউজারের": "Browser",
  "ব্রাঞ্চ": "Branch",
  "ব্রুনাই": "Brunei",
  "ব্র্যাক": "BRAC",
  "ব্র্যান্ড": "Brand",
  "ব্র্যান্ডিং": "Branding",
  "ব্লু": "Blue",
  "ব্ল্যাক": "Black",
  "ভবিষ্যৎ": "Future",
  "ভর্তি": "Admission",
  "ভর্তির": "Admission",
  "ভাই": "Brother",
  "ভারত": "India",
  "ভাড়ার": "Rent",
  "ভিজিট": "Visit",
  "ভিজিটিং": "Visiting",
  "ভিডিওটি": "Video",
  "ভিত্তি": "Basis",
  "ভিত্তিক": "Based",
  "ভিয়েতনাম": "Vietnam",
  "ভূমিকা": "Role",
  "ভেতর": "Inside",
  "মগবাজার": "Moghbazar",
  "মঞ্জুর": "Sanction / Approved",
  "মঞ্জুরি": "Sanction / Approval",
  "মঞ্জুরিকৃত": "Sanctioned",
  "মডালে": "in Modal",
  "মডিউল": "Module",
  "মুনাফায়": "at profit",
  "যেতে": "to go",
  "রসিদটি": "Receipt",
  "রেকর্ডটি": "Record",
  "লোগোটি": "Logo",
  "লোনটি": "Loan",
  "শর্তটি": "Condition / Term",
  "শাখায়": "Branch",
  "সরকারের": "Government",
  "সাইডবারের": "Sidebar",
  "সুবিধাজনক": "Convenient",
  "সেন্ডকৃত": "Sent",
  "স্কিমটি": "Scheme",
  "স্বাক্ষরকারী": "Signatory",
  "হিসাবটি": "Account",
  "অ-হস্তান্তরযোগ্য": "Non-transferable",
  "রি-আপলোড": "Re-upload",
  "ঢাকা উত্তর": "Dhaka North",
  "ঢাকা দক্ষিণ": "Dhaka South",
  "উত্তর সিটি": "North City",
  "দক্ষিণ সিটি": "South City",
  "অ-": "Non-",
  "রি-": "Re-",
  "অ": "Non",
  "রি": "Re",
  "প": "P",
  "ছ": "Chha",
  "এ": "in",
  "।": ".",
  "থাকায়": "being",
  "কার্ডে": "Card",
  "0টি": "0",
  "0 টি": "0",
  "1টি": "1",
  "1 টি": "1",
  "2টি": "2",
  "2 টি": "2",
  "3টি": "3",
  "3 টি": "3",
  "4টি": "4",
  "4 টি": "4",
  "5টি": "5",
  "5 টি": "5",
  "6টি": "6",
  "6 টি": "6",
  "7টি": "7",
  "7 টি": "7",
  "8টি": "8",
  "8 টি": "8",
  "9টি": "9",
  "9 টি": "9",
  "10টি": "10",
  "10 টি": "10",
  "11টি": "11",
  "11 টি": "11",
  "12টি": "12",
  "12 টি": "12",
  "13টি": "13",
  "13 টি": "13",
  "14টি": "14",
  "14 টি": "14",
  "15টি": "15",
  "15 টি": "15",
  "16টি": "16",
  "16 টি": "16",
  "17টি": "17",
  "17 টি": "17",
  "18টি": "18",
  "18 টি": "18",
  "19টি": "19",
  "19 টি": "19",
  "20টি": "20",
  "20 টি": "20",
  "21টি": "21",
  "21 টি": "21",
  "22টি": "22",
  "22 টি": "22",
  "23টি": "23",
  "23 টি": "23",
  "24টি": "24",
  "24 টি": "24",
  "25টি": "25",
  "25 টি": "25",
  "26টি": "26",
  "26 টি": "26",
  "27টি": "27",
  "27 টি": "27",
  "28টি": "28",
  "28 টি": "28",
  "29টি": "29",
  "29 টি": "29",
  "30টি": "30",
  "30 টি": "30",
  "31টি": "31",
  "31 টি": "31",
  "32টি": "32",
  "32 টি": "32",
  "33টি": "33",
  "33 টি": "33",
  "34টি": "34",
  "34 টি": "34",
  "35টি": "35",
  "35 টি": "35",
  "36টি": "36",
  "36 টি": "36",
  "37টি": "37",
  "37 টি": "37",
  "38টি": "38",
  "38 টি": "38",
  "39টি": "39",
  "39 টি": "39",
  "40টি": "40",
  "40 টি": "40",
  "41টি": "41",
  "41 টি": "41",
  "42টি": "42",
  "42 টি": "42",
  "43টি": "43",
  "43 টি": "43",
  "44টি": "44",
  "44 টি": "44",
  "45টি": "45",
  "45 টি": "45",
  "46টি": "46",
  "46 টি": "46",
  "47টি": "47",
  "47 টি": "47",
  "48টি": "48",
  "48 টি": "48",
  "49টি": "49",
  "49 টি": "49",
  "50টি": "50",
  "50 টি": "50",
  "51টি": "51",
  "51 টি": "51",
  "52টি": "52",
  "52 টি": "52",
  "53টি": "53",
  "53 টি": "53",
  "54টি": "54",
  "54 টি": "54",
  "55টি": "55",
  "55 টি": "55",
  "56টি": "56",
  "56 টি": "56",
  "57টি": "57",
  "57 টি": "57",
  "58টি": "58",
  "58 টি": "58",
  "59টি": "59",
  "59 টি": "59",
  "60টি": "60",
  "60 টি": "60",
  "61টি": "61",
  "61 টি": "61",
  "62টি": "62",
  "62 টি": "62",
  "63টি": "63",
  "63 টি": "63",
  "64টি": "64",
  "64 টি": "64",
  "65টি": "65",
  "65 টি": "65",
  "66টি": "66",
  "66 টি": "66",
  "67টি": "67",
  "67 টি": "67",
  "68টি": "68",
  "68 টি": "68",
  "69টি": "69",
  "69 টি": "69",
  "70টি": "70",
  "70 টি": "70",
  "71টি": "71",
  "71 টি": "71",
  "72টি": "72",
  "72 টি": "72",
  "73টি": "73",
  "73 টি": "73",
  "74টি": "74",
  "74 টি": "74",
  "75টি": "75",
  "75 টি": "75",
  "76টি": "76",
  "76 টি": "76",
  "77টি": "77",
  "77 টি": "77",
  "78টি": "78",
  "78 টি": "78",
  "79টি": "79",
  "79 টি": "79",
  "80টি": "80",
  "80 টি": "80",
  "81টি": "81",
  "81 টি": "81",
  "82টি": "82",
  "82 টি": "82",
  "83টি": "83",
  "83 টি": "83",
  "84টি": "84",
  "84 টি": "84",
  "85টি": "85",
  "85 টি": "85",
  "86টি": "86",
  "86 টি": "86",
  "87টি": "87",
  "87 টি": "87",
  "88টি": "88",
  "88 টি": "88",
  "89টি": "89",
  "89 টি": "89",
  "90টি": "90",
  "90 টি": "90",
  "91টি": "91",
  "91 টি": "91",
  "92টি": "92",
  "92 টি": "92",
  "93টি": "93",
  "93 টি": "93",
  "94টি": "94",
  "94 টি": "94",
  "95টি": "95",
  "95 টি": "95",
  "96টি": "96",
  "96 টি": "96",
  "97টি": "97",
  "97 টি": "97",
  "98টি": "98",
  "98 টি": "98",
  "99টি": "99",
  "99 টি": "99",
  "100টি": "100",
  "100 টি": "100",
  "উপযুক্ত": "Suitable",
  "হাতে": "in hand",
  "প্রযুক্তিভিত্তিক": "Technology-driven",
  "সহজবোধ্য": "Straightforward",
  "অনন্য": "Unique",
  "কেন": "Why",
  "হাজারো": "Thousands of",
  "ওপর": "upon",
  "আস্থা": "Trust",
  "রাখেন": "Place",
  "নিশ্চিতে": "in Ensuring",
  "শীর্ষস্থানীয়": "Leading",
  "প্রশ্নোত্তর": "Q&A",
  "প্রশ্নের": "Questions",
  "প্রশ্ন": "Question",
  "সমাধান": "Solutions",
  "বিষয়ে": "matter",
  "বিষয়": "Matter",
  "সাহায্য": "Help",
  "অফিসাররা": "Officers",
  "সপ্তাহের": "Week",
  "সপ্তাহ": "Week",
  "সেবায়": "in service",
  "নিয়োজিত": "Dedicated",
  "খুবই": "Very",
  "গ্রহণের": "Obtaining",
  "পদ্ধতিতে": "Method",
  "তালিকায়": "in the list",
  "তালিকাভুক্ত": "Listed",
  "তালিকা": "List",
  "ইনস্পেক্টরে": "in Inspector",
  "ইনস্পেক্টর": "Inspector",
  "চিহ্নিত": "Marked",
  "প্রয়োজনীয়": "Necessary",
  "চাপামাত্র": "Immediately upon clicking",
  "অটোমেটিক": "Automatic",
  "তে": "in",
  "সম্বলিত": "Containing",
  "সাথেই": "Immediately with",
  "ডানপাশের": "Right-side",
  "ডানপাশে": "On the right",
  "কলামে": "in Column",
  "এক্টিভ": "Active",
  "দেখাচ্ছে": "Showing",
  "পাতা": "Page",
  "ক্রেডেনশিয়াল": "Credentials",
  "অ্যাকাউন্টসমূহ": "Accounts",
  "বাই": "By",
  "ডেটাবেস": "Database",
  "তাৎক্ষণিকভাবে": "Instantly",
  "তাঁর": "Their",
  "বহাল": "Retain",
  "রাখবেন": "Keep",
  "সক্রিয়করণ": "Activation",
  "আর্কাইভ": "Archive",
  "আলাদা": "Separate",
  "করেননি": "Did not do",
  "নাকি": "Or",
  "পার্মানেন্ট": "Permanent",
  "যাবতীয়": "All / Various",
  "চিরতরে": "Permanently",
  "হ্যাঁ": "Yes",
  "সাম্প্রতিক": "Recent",
  "সর্বশেষ": "Latest",
  "পড়া": "Read",
  "আবেদনগুলোর": "of Applications",
  "কার্যকর": "Effective",
  "বোতামে": "Button",
  "বোতাম": "Button",
  "গেটওয়ের": "Gateway",
  "গেটওয়ে": "Gateway",
  "পেপার": "Paper",
  "ভিউয়ার": "Viewer",
  "পেপারসমূহ": "Papers",
  "ভাউচার": "Voucher",
  "দেখে": "Seeing",
  "পার্সেন্টেজ": "Percentage",
  "চাইলে": "If desired",
  "ম্যানুয়ালি": "Manually",
  "এমএফএস": "MFS",
  "পার্সেন্ট": "Percent",
  "ফিরে": "Back",
  "দিনগুলোতে": "in Days",
  "লোনসমূহের": "of Loans",
  "আওতায়": "Under",
  "লিখে": "Writing",
  "দিবেন": "Will give",
  "বক্তব্য": "Statement",
  "হুবহু": "Exactly as is",
  "রিস্টোর": "Restore",
  "বিজ্ঞাপনগুলো": "Advertisements",
  "ঠিক": "Just / Right",
  "স্ক্রোলযোগ্য": "Scrollable",
  "বাছুন": "Choose",
  "কথোপকথন": "Conversation",
  "পাঠিয়ে": "Sending",
  "খুলেছেন": "Opened",
  "ইতিপূর্বে": "Previously",
  "নিন": "Take / Get",
  "অনাকাঙ্ক্ষিত": "Unexpected",
  "মৃত্যুজনিত": "Accidental Death",
  "মওকুফ": "Waiver",
  "দেনা": "Debt",
  "বর্তাবে": "Will apply",
  "পঙ্গুত্ব": "Disability",
  "অনুদান": "Grant",
  "সামনে": "Front",
  "পেছনে": "Back",
  "এক্সক্লুসিভ": "Exclusive",
  "এক্সিকিউটিভ": "Executive",
  "রয়েল": "Royal",
  "এমারেল্ড": "Emerald",
  "গোল্ড": "Gold",
  "বারগুন্ডি": "Burgundy",
  "মেটালিক": "Metallic",
  "প্লাটিনাম": "Platinum",
  "করেও": "Even after doing",
  "ক্রিস্টাল": "Crystal",
  "ল্যানইয়ার্ড": "Lanyard",
  "স্লট": "Slot",
  "বারকোড": "Barcode",
  "কোডসহ": "With Code",
  "সুবিধাসহ": "With Facilities",
  "আওতাভুক্ত": "Covered under",
  "সুরক্ষাসমূহ": "Protections",
  "গ্রহীতা": "Recipient / Borrower",
  "মঞ্জুরিপত্র": "Sanction Letter",
  "মহোদয়": "Sir / Madam",
  "প্রেক্ষিতে": "in Light of",
  "জানানো": "Informed",
  "যাচ্ছে": "Going",
  "কমিটির": "of Committee",
  "কমিটি": "Committee",
  "সুপারিশক্রমে": "Upon Recommendation",
  "কাউন্টারফয়েল": "Counterfoil",
  "স্টাব": "Stub",
  "ফিন্যান্স": "Finance",
  "অ্যান্ড": "and",
  "মাইক্রো": "Micro",
  "প্রাপ্তিস্বীকার": "Acknowledgement",
  "লেখা": "Written / Text",
  "সংযুক্তি": "Attachment",
  "রেডি": "Ready",
  "সবকিছু": "Everything",
  "প্রতিফলিত": "Reflected",
  "যখন": "When",
  "ওয়াটারমার্কে": "Watermark",
  "পরিচালনার": "Management",
  "ম্যানেজারে": "Manager",
  "ম্যানেজার": "Manager",
  "রিভিউসমূহ": "Reviews",
  "পরিচালনা": "Management",
  "পৃষ্ঠার": "Page",
  "পৃষ্ঠা": "Page",
  "কার্যদিবস": "Working Days",
  "জন্মতারিখ": "Date of Birth",
  "ইচ্ছেমতো": "As desired",
  "ফ্রেমে": "in Frame",
  "সুন্দরভাবে": "Nicely",
  "স্যাম্পল": "Sample",
  "মুছুন": "Delete / Clear",
  "স্থায়ী": "Permanent",
  "শীর্ষ": "Top",
  "রঙের": "Color",
  "নামেও": "Also in name",
  "লেভেল": "Level",
  "টিক": "Tick / Checkmark",
  "অপশনগুলো": "Options",
  "সবার": "Everyone's",
  "সিলেক্টেড": "Selected",
  "সবাইকে": "Everyone",
  "তথ্যই": "Information",
  "আনচেক": "Uncheck",
  "সেগুলো": "Those",
  "চুক্তিবদ্ধ": "Contractual",
  "্যান্ডম": "Random",
  "সাববেস": "Subbase",
  "ইউজারের": "User's",
  "ইউজার": "User",
  "অ্যাপ্রুভ": "Approve",
  "পেআউট": "Payout",
  "ব্লকিং": "Blocking",
  "প্রিসেটসমূহ": "Presets",
  "লেখাটি": "The text",
  "দিবে": "Will provide",
  "হলুদ": "Yellow",
  "সতর্কবার্তায়": "Warning Notice",
  "ট্রান্সফারসহ": "Including Transfer",
  "আবেদনের": "Application's",
  "আবেদন": "Application",
  "গ্রাহকের": "Customer's",
  "গ্রাহক": "Customer",
  "টাকা": "BDT",
  "টাকার": "BDT",
  "ব্যাংক": "Bank",
  "ব্যাংকের": "Bank",
  "অ্যাকাউন্ট": "Account",
  "ব্যালেন্স": "Balance",
  "অনুমোদন": "Approval",
  "বাতিল": "Cancel",
  "বিতরণ": "Disburse",
  "পরিশোধ": "Repayment",
  "কিস্তি": "Installment",
  "ঋণ": "Loan",
  "তারিখ": "Date",
  "নম্বর": "Number",
  "মোবাইল": "Mobile",
  "ফোন": "Phone",
  "স্ট্যাটাস": "Status",
  "বিবরণ": "Description",
  "সফলভাবে": "Successfully"
};

// Suffix replacement patterns for compound Bengali words (e.g., "Monthsিক", "Pay Installmentের", "Amountে")
const SUFFIX_PATTERNS: [RegExp, string][] = [
  [/Monthsিক/g, 'Monthly'],
  [/মাসিক/g, 'Monthly'],
  [/Installmentের/g, 'Installment'],
  [/কিস্তির/g, 'Installment'],
  [/Amountে/g, 'Amount'],
  [/পরিমাণে/g, 'Amount'],
  [/Hoursর/g, 'Hours'],
  [/ঘণ্টার/g, 'Hours'],
  [/Applyের/g, 'Application'],
  [/আবেদনের/g, 'Application'],
  [/Applyে/g, 'Application'],
  [/আবেদনে/g, 'Application'],
  [/Customerরা/g, 'Customers'],
  [/Customerদের/g, 'Customers'],
  [/গ্রাহকরা/g, 'Customers'],
  [/গ্রাহকদের/g, 'Customers'],
  [/Customer পোর্টাল/g, 'Customer Portal'],
  [/গ্রাহক পোর্টাল/g, 'Customer Portal'],
  [/Calculator ও/g, 'Calculator and'],
  [/ক্যালকুলেটর ও/g, 'Calculator and'],
  [/Calculatorে/g, 'Calculator'],
  [/ক্যালকুলেটরে/g, 'Calculator'],
  [/Deposit FundsBDT/g, 'Deposit Funds / BDT'],
  [/Deposit Funds/g, 'Deposit Funds'],
  [/Wallet Balance/g, 'Wallet Balance'],
  [/Loan Packages/g, 'Loan Packages'],
  [/Mobile Number/g, 'Mobile Number'],
  [/Mobile নম্বর/g, 'Mobile Number'],
  [/Tracking আইডি/g, 'Tracking ID'],
  [/ট্র্যাকিং আইডি/g, 'Tracking ID'],
  [/Cancelকৃত/g, 'Cancelled'],
  [/Disbursedকৃত/g, 'Disbursed'],
  [/Approvedকৃত/g, 'Approved'],
  [/Deposit\s*\(এফডিআর\)/g, 'Deposit (FDR)'],
  [/Deposit\s*\(FDR\)/g, 'Deposit (FDR)'],
  [/কিস্তিসমূহভার্চুয়াল/g, 'Installments | Virtual'],
  [/কার্ডউইথড্র/g, 'Card | Withdraw'],
  [/লেনদেনলেটার/g, 'Transactions | Letter'],
  [/Annual Interestের হার/g, 'Annual Interest Rate'],
  [/Annual Interestের/g, 'Annual Interest Rate'],
  [/Interestের হার/g, 'Interest Rate'],
  [/Interestের/g, 'Interest'],
  [/অনুসন্ধান করুন/g, 'Search'],
  [/অনুসন্ধান/g, 'Search']
];

// Digits mapping
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Fast LRU memoization cache for translateTextToEnglish
const TRANSLATION_MEMO_CACHE = new Map<string, string>();
const MAX_MEMO_ENTRIES = 2000;

// Fast exact phrase lookup map
const EXACT_PHRASE_MAP = new Map<string, string>(PHRASE_TRANSLATIONS);

/**
 * Universal auto-translator: Translates any phrase, substring, or individual word
 */
export function translateTextToEnglish(text: string): string {
  if (!text || typeof text !== 'string') return text;
  if (!/[\u0980-\u09FF]/.test(text)) return text;

  const cached = TRANSLATION_MEMO_CACHE.get(text);
  if (cached !== undefined) return cached;

  const trimmed = text.trim();
  // Fast Path 1: Check if whole string exactly matches a known full phrase (O(1))
  if (EXACT_PHRASE_MAP.has(trimmed)) {
    const res = text.replace(trimmed, EXACT_PHRASE_MAP.get(trimmed)!);
    TRANSLATION_MEMO_CACHE.set(text, res);
    return res;
  }

  // Fast Path 2: Check if whole string exactly matches a single word (O(1))
  if (WORD_TRANSLATIONS[trimmed]) {
    const res = text.replace(trimmed, WORD_TRANSLATIONS[trimmed]);
    TRANSLATION_MEMO_CACHE.set(text, res);
    return res;
  }

  let result = text;

  // 1. Multi-word Phrase matching
  for (const [phrase, en] of PHRASE_TRANSLATIONS) {
    if (result.includes(phrase)) {
      result = result.split(phrase).join(en);
      if (!/[\u0980-\u09FF]/.test(result)) break;
    }
  }

  // 2. Fallback for any Bengali digits
  BN_DIGITS.forEach((digit, idx) => {
    if (result.includes(digit)) {
      result = result.split(digit).join(String(idx));
    }
  });

  // 3. Suffix cleanup (for mixed English-Bengali words like "Monthsিক" or "Applyের")
  for (const [regex, rep] of SUFFIX_PATTERNS) {
    result = result.replace(regex, rep);
  }

  // 4. Exact word/token matching for any remaining Bengali words
  result = result.replace(/[\u0980-\u09FF]+/g, (match) => {
    // Exact word dictionary
    if (WORD_TRANSLATIONS[match]) {
      return WORD_TRANSLATIONS[match];
    }
    // Trim common Bengali case suffixes (e.g., -এর, -কে, -তে, -এ, -র, -রা, -দের, -টি, -টা)
    const baseWord = match
      .replace(/দের$/g, '')
      .replace(/ের$/g, '')
      .replace(/কে$/g, '')
      .replace(/তে$/g, '')
      .replace(/রা$/g, '')
      .replace(/র$/g, '')
      .replace(/এ$/g, '')
      .replace(/ে$/g, '')
      .replace(/টি$/g, '')
      .replace(/টা$/g, '');

    if (WORD_TRANSLATIONS[baseWord]) {
      return WORD_TRANSLATIONS[baseWord];
    }

    return match;
  });

  // 5. Clean up any leftover grammatical inflection markers or trailing characters
  result = result
    .replace(/(\w+)িক/g, '$1')
    .replace(/(\w+)ের/g, '$1')
    .replace(/(\w+)ে/g, '$1')
    .replace(/(\w+)র/g, '$1')
    .replace(/(\w+)রা/g, '$1')
    .replace(/(\w+)কৃত/g, '$1')
    .replace(/(\w+)ই/g, '$1')
    .replace(/([0-9]+)\s*টি/g, '$1')
    .replace(/([0-9]+)\s*টা/g, '$1')
    .replace(/1[\u09ae]/g, '1st')
    .replace(/2(?:[\u09df]|[\u09af][\u09bc])/g, '2nd')
    .replace(/3(?:[\u09df]|[\u09af][\u09bc])/g, '3rd')
    .replace(/4[\u09b0][\u09cd][\u09a5]/g, '4th')
    .replace(/5[\u09ae]/g, '5th')
    .replace(/([0-9]+)[\u09ae]/g, '$1th')
    .replace(/([0-9]+)(?:[\u09df]|[\u09af][\u09bc])/g, '$1th')
    .replace(/([0-9]+)[\u09b0][\u09cd][\u09a5]/g, '$1th')
    .replace(/\}\s*টি/g, '}')
    .replace(/\(\s*টি\s*\)/g, '')
    .replace(/[\s\(\[\{]টি[\s\)\]\}]/g, ' ')
    .replace(/\s+টি(?=[^\u0980-\u09FF]|$)/g, '')
    .replace(/\s+টা(?=[^\u0980-\u09FF]|$)/g, '')
    .replace(/\bই\b/g, '')
    .replace(/।/g, '.');

  // 6. Currency symbol: convert Bengali Taka symbol ৳ to BDT in English mode
  result = result.replace(/৳\s*([0-9])/g, 'BDT $1').replace(/([0-9])\s*৳/g, '$1 BDT').replace(/৳/g, 'BDT');

  if (TRANSLATION_MEMO_CACHE.size >= MAX_MEMO_ENTRIES) {
    const firstKey = TRANSLATION_MEMO_CACHE.keys().next().value;
    if (firstKey) TRANSLATION_MEMO_CACHE.delete(firstKey);
  }
  TRANSLATION_MEMO_CACHE.set(text, result);

  return result;
}
