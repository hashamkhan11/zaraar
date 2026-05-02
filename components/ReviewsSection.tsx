"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

interface Review {
  id: number;
  name: string;
  city: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  avatar?: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Muhammad Bilal",
    city: "Lahore",
    rating: 5,
    text: "yaar ye deep blue single tone liya tha soch ke COD hai try karte hain. seedha bolunga — expect nahi tha itna acha hoga. chain ekdum solid feel hai wrist pe. office mein pehle din hi ek colleague ne poochha kahan se liya. abbu ko bhi dene ka soch raha hoon ab.",
    date: "2 days ago",
    verified: true,
    avatar: "/reviews/muhammad_bilal.jpg",
  },
  {
    id: 2,
    name: "Hamza Sheikh",
    city: "Karachi",
    rating: 5,
    text: "ice blue wali hit hai. photos se bhi zyada acha hai real mein. wife ne bhi pasand kiya jo apne aap mein achievement hai 😂",
    date: "4 days ago",
    verified: true,
  },
  {
    id: 3,
    name: "Ali Raza",
    city: "Rawalpindi",
    rating: 5,
    text: "leather strap wala abbu ke liye gift kiya tha. honestly mujhe khud nahi pata tha kaisa hoga. jab aaya toh watch dekhi toh acha laga. abbu ne pehan ke rishtedar ke ghar gaye toh wahan se 2 log WhatsApp pe poochh rahe the ke kahan se liya. ek ne toh order bhi kar diya. khud feel good hua 😂 shukriya Fahad bhai.",
    date: "1 week ago",
    verified: true,
    avatar: "/reviews/ali_raza.jpg",
  },
  {
    id: 4,
    name: "Zain Malik",
    city: "Karachi",
    rating: 5,
    text: "Champagne gold is fire. Manager noticed it on day one. COD made it easy to try. Will order again.",
    date: "1 week ago",
    verified: true,
    avatar: "/reviews/zain_malik.jpg",
  },
  {
    id: 5,
    name: "Raza Mahmood",
    city: "Lahore",
    rating: 5,
    text: "pearl white single tone liya. sach bolunga pehle price thoda zyada laga. but real mein dekha toh samajh aaya — quality ka fark pata chalta hai wrist pe. roz office pehan ke jaata hoon, ekdum clean look hai.",
    date: "10 days ago",
    verified: true,
  },
  {
    id: 6,
    name: "Hassan Khan",
    city: "Peshawar",
    rating: 4,
    text: "TST deep blue mangwaya. dial ki shine real mein alag hi hai, photo mein nahi aati. delivery thodi late aayi, 6 din lag gaye. watch se koi complaint nahi but delivery faster hoti toh 5 deta.",
    date: "2 weeks ago",
    verified: true,
  },
  {
    id: 7,
    name: "Fahad Mirza",
    city: "Faisalabad",
    rating: 4,
    text: "midnight black liya. ek din thoda late aaya lekin seller ne WhatsApp pe khud update kiya raha toh tension nahi hua. watch roz pehanta hoon koi masla nahi. next time bhi yahan se lunga.",
    date: "2 weeks ago",
    verified: true,
  },
  {
    id: 8,
    name: "Usman Tariq",
    city: "Islamabad",
    rating: 5,
    text: "3rd order hai mera 😂 bas itna.",
    date: "3 weeks ago",
    verified: true,
  },
  {
    id: 9,
    name: "Ayesha Malik",
    city: "Karachi",
    rating: 5,
    text: "husband ke birthday pe dual tone midnight black liya. watch dekhi toh bohot pasand aayi usse, baar baar pehan ke dekh raha tha 😄 masha Allah acha purchase tha.",
    date: "3 weeks ago",
    verified: true,
    avatar: "/reviews/ayesha_malik.jpg",
  },
  {
    id: 10,
    name: "Kamran Ali",
    city: "Sialkot",
    rating: 4,
    text: "brown leather wala liya. stitching clean hai koi ulta seedha cut nahi. back se andar movement dikh raha hai jo is price range mein unexpected tha. clasp thoda tight tha pehle pehle but ab theek ho gaya. overall value for money hai.",
    date: "1 month ago",
    verified: true,
  },
  {
    id: 11,
    name: "Tariq Hussain",
    city: "Gujranwala",
    rating: 5,
    text: "ivory white dual tone. real mein photo se kaafi acha hai. bas itna kahunga.",
    date: "1 month ago",
    verified: true,
  },
  {
    id: 12,
    name: "Imran Siddiqui",
    city: "Hyderabad",
    rating: 5,
    text: "sach batao toh pehle Instagram pe ad dekha toh ignore kar diya. phir doosri baar dikha toh socha COD hai kya jayega order kar diya. honestly bhai expect nahi tha itna acha hoga. watch photos se bhi acha tha real mein, delivery time pe, packing proper thi. ab 2 doston ko bhi bata diya. genuine seller hai.",
    date: "5 weeks ago",
    verified: true,
  },
  {
    id: 13,
    name: "Asad Khan",
    city: "Lahore",
    rating: 5,
    text: "deep blue liya. office mein pehle din 2 logo ne notice kiya. bas yahi kaafi hai 😄",
    date: "5 weeks ago",
    verified: true,
    avatar: "/reviews/asad_khan.jpg",
  },
  {
    id: 14,
    name: "Omer Farooq",
    city: "Karachi",
    rating: 5,
    text: "Pearl white. Clean. Simple. Arrived in 3 days. Good seller.",
    date: "6 weeks ago",
    verified: true,
  },
  {
    id: 15,
    name: "Rizwan Ali",
    city: "Abbottabad",
    rating: 5,
    text: "midnight black matte finish wala liya. bhai alag hi vibe hai, na zyada shiny na dull. abbottabad mein bhi easily aaya. ab roz pehanta hoon.",
    date: "6 weeks ago",
    verified: true,
  },
  {
    id: 16,
    name: "Waqar Ahmed",
    city: "Bahawalpur",
    rating: 4,
    text: "Watch is good. Delivery took 6 days which was slow. No other complaints.",
    date: "7 weeks ago",
    verified: true,
  },
  {
    id: 17,
    name: "Saad Rehman",
    city: "Lahore",
    rating: 5,
    text: "dost ko birthday pe dual tone white di. watch dekh ke khush hua, baar baar poochh raha tha kahan se liya 😂 khud ke liye bhi lena hai ab.",
    date: "7 weeks ago",
    verified: true,
  },
  {
    id: 18,
    name: "Shahid Iqbal",
    city: "Quetta",
    rating: 5,
    text: "TST deep blue. wo shine jo hai dial pe photo mein nahi aati, real mein hi pata chalta hai. Quetta tak bhi jaldi aaya. mast hai.",
    date: "2 months ago",
    verified: true,
    avatar: "/reviews/shahid_iqbal.jpg",
  },
  {
    id: 19,
    name: "Adeel Khan",
    city: "Faisalabad",
    rating: 5,
    text: "brown leather boss ko eid pe gift kiya. unhone board meeting mein pehan ke gaye aur baad mein bole ye toh 5000 se upar ka lagta hai 😂 mission accomplished. khud ke liye bhi order karna hai ab.",
    date: "2 months ago",
    verified: true,
  },
  {
    id: 20,
    name: "Junaid Hassan",
    city: "Islamabad",
    rating: 5,
    text: "Ordered ice blue. Exactly as shown. Fast delivery. No complaints.",
    date: "2 months ago",
    verified: true,
    avatar: "/reviews/junaid_hassan.jpg",
  },
  {
    id: 21,
    name: "Farrukh Mirza",
    city: "Multan",
    rating: 4,
    text: "forest green single tone liya. ye color kisi ke paas nahi hogi seriously. box thoda dented tha bahar se but watch andar bilkul fine thi. different look chahiye tha woh mil gaya.",
    date: "2 months ago",
    verified: true,
  },
  {
    id: 22,
    name: "Bilal Ahmed",
    city: "Multan",
    rating: 5,
    text: "black leather daily wear ban gaya. movement jo back se dikh raha hai woh unexpected tha aur acha laga. value for money.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 23,
    name: "Nabeel Ahmad",
    city: "Karachi",
    rating: 5,
    text: "deep blue liya. solid hai. roz pehanta hoon.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 24,
    name: "Muneeb Khan",
    city: "Lahore",
    rating: 5,
    text: "Pearl white. Wore it to a wedding. Got compliments. Worth it.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 25,
    name: "Shoaib Raza",
    city: "Islamabad",
    rating: 4,
    text: "dual tone champagne gold order kiya. pehle price dekh ke ruka tha thodi der. phir soch ke COD hai toh try karte hain. delivery 5 din mein aayi, watch sahi nikli. price ka gila nahi raha baad mein.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 26,
    name: "Bilal Chaudhry",
    city: "Rawalpindi",
    rating: 5,
    text: "ice blue liya tha. color bahut subtle hai, sab se alag lagta hai. 2 log poochh chuke hain kahan se liya.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 27,
    name: "Waseem Ali",
    city: "Multan",
    rating: 5,
    text: "Deep blue. 10/10.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 28,
    name: "Danish Riaz",
    city: "Faisalabad",
    rating: 5,
    text: "leather brown wala bhai ke liye liya eid pe. usne pehan ke bola yaar ye toh acha hai. khud bhi lena hai ab.",
    date: "3 months ago",
    verified: true,
  },
  {
    id: 29,
    name: "Kashif Mehmood",
    city: "Karachi",
    rating: 4,
    text: "TST deep blue mangwaya. watch acha hai, thodi delivery slow thi but worth it overall.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 30,
    name: "Omar Shahid",
    city: "Lahore",
    rating: 5,
    text: "pearl white single tone. clean look. roz office pehan ke jaata hoon. no regrets.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 31,
    name: "Sohail Ahmed",
    city: "Gujranwala",
    rating: 5,
    text: "midnight black single tone liya. matte finish wala alag hi banda lagta hai pehan ke. dost poochh raha tha kahan se liya toh acha laga 😄",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 32,
    name: "Rehan Malik",
    city: "Sialkot",
    rating: 4,
    text: "Leather strap brown. Stitching is neat. Took 5 days. Would buy again.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 33,
    name: "Yasir Khan",
    city: "Peshawar",
    rating: 5,
    text: "forest green single tone order ki. yaar seriously ye color unique hai, kisi ke paas nahi hogi. quality bhi theek hai, satisfied hoon.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 34,
    name: "Sajid Hussain",
    city: "Hyderabad",
    rating: 5,
    text: "COD dekh ke order kiya pehli dafa. acha nikla. ab COD ke bina order hi nahi karta online.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 35,
    name: "Faisal Butt",
    city: "Lahore",
    rating: 5,
    text: "2nd order hai mera. pehli baar black liya tha, is baar deep blue. dono acha experience raha. Fahad bhai consistent hai.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 36,
    name: "Arslan Sheikh",
    city: "Karachi",
    rating: 4,
    text: "theek hai watch. price ke hisaab se koi complaint nahi. delivery normal speed thi.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 37,
    name: "Zubair Ahmad",
    city: "Quetta",
    rating: 5,
    text: "Ivory white dual tone. Real mein kaafi acha hai. Quetta mein bhi aa gaya time pe.",
    date: "4 months ago",
    verified: true,
  },
  {
    id: 38,
    name: "Hamid Ali",
    city: "Bahawalpur",
    rating: 5,
    text: "cousin ko gift kiya. wo khush tha, main khush tha. acha raha.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 39,
    name: "Tariq Mehmood",
    city: "Abbottabad",
    rating: 4,
    text: "Good watch for the price. Nothing fancy but does the job well.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 40,
    name: "Noman Khan",
    city: "Islamabad",
    rating: 5,
    text: "TST wali series alag hi hai bhai. dial pe jo texture hai wo in hand hi pata chalta hai. satisfied purchase tha.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 41,
    name: "Waqas Hassan",
    city: "Lahore",
    rating: 5,
    text: "Zabardast. Bas.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 42,
    name: "Shehzad Ali",
    city: "Karachi",
    rating: 5,
    text: "champagne gold dual tone liya. yaar real mein photos se different hai, aur acha hai. slim fit, comfortable. roz pehanta hoon.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 43,
    name: "Asim Raza",
    city: "Faisalabad",
    rating: 4,
    text: "Black leather. Good quality for price. Delivery was 6 days.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 44,
    name: "Mohsin Iqbal",
    city: "Multan",
    rating: 5,
    text: "pehle bahut soch ke order kiya tha. COD tha lekin phir bhi darr tha. but watch dekh ke sab thik laga. ek hafte mein 3 dosto ne pooch liya kahan se li hai. ab recommend karta hoon seedha.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 45,
    name: "Rizwan Sheikh",
    city: "Rawalpindi",
    rating: 5,
    text: "Deep blue single tone. Clean dial. Comfortable on wrist. Happy.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 46,
    name: "Junaid Malik",
    city: "Gujranwala",
    rating: 5,
    text: "black chain wali liya. roz office jata hoon pehne ke. koi zyada baat nahi bas acha hai.",
    date: "5 months ago",
    verified: true,
  },
  {
    id: 47,
    name: "Kamran Butt",
    city: "Lahore",
    rating: 4,
    text: "watch acha hai. price mein thoda hesitation tha pehle lekin real mein dekha toh feel acha hai, sasta nahi lagta wrist pe. color photos se thoda alag tha but overall pasand aaya.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 48,
    name: "Shahbaz Khan",
    city: "Karachi",
    rating: 5,
    text: "ice blue order kiya. alag color hai. khush hoon.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 49,
    name: "Umar Farooq",
    city: "Sialkot",
    rating: 5,
    text: "leather strap black liya. stitching clean hai, comfortable hai. daily wear ban gaya hai. acha purchase tha.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 50,
    name: "Naeem Ahmad",
    city: "Peshawar",
    rating: 5,
    text: "mast watch hai bhai. paisa wasool.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 51,
    name: "Imtiaz Ali",
    city: "Hyderabad",
    rating: 5,
    text: "Dual tone midnight black. Looks premium. Good COD service.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 52,
    name: "Babar Khan",
    city: "Islamabad",
    rating: 5,
    text: "deep blue wala liya. yaar poori team ne notice kiya office mein pehle din. ek bande ne seriously poochha kitne ka tha, mujhe khud sharam aayi itna sasta tha 😂",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 53,
    name: "Aamir Siddiqui",
    city: "Lahore",
    rating: 4,
    text: "acha hai. koi badi cheez nahi but price ke liye bilkul theek hai.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 54,
    name: "Ghulam Hassan",
    city: "Multan",
    rating: 5,
    text: "abbu ke liye single tone black liya. unhone pehan ke bola acha hai beta. bas yahi sunna tha.",
    date: "6 months ago",
    verified: true,
  },
  {
    id: 55,
    name: "Irfan Malik",
    city: "Karachi",
    rating: 5,
    text: "White single tone. Office. Daily. Solid.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 56,
    name: "Saim Chaudhry",
    city: "Faisalabad",
    rating: 5,
    text: "TST green wali try ki. alag cheez hai yaar, kisi ke paas nahi hogi ye color. quality bhi achi hai is price range mein.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 57,
    name: "Ahsan Raza",
    city: "Rawalpindi",
    rating: 4,
    text: "Decent watch. Delivery was okay. Price is fair.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 58,
    name: "Tahir Hussain",
    city: "Lahore",
    rating: 5,
    text: "dual tone white ivory liya. yaar real mein photos se zyada acha lagta hai. office mein kaafi logo ne notice kiya. ab 2nd watch lene ka plan bana raha hoon.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 59,
    name: "Owais Khan",
    city: "Karachi",
    rating: 5,
    text: "Midnight black matte. Understated and clean. Love it.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 60,
    name: "Luqman Ali",
    city: "Quetta",
    rating: 5,
    text: "bhai pehli dafa online watch li. COD tha isliye himmat hui. aur sach mein acha aaya. Quetta mein bhi aa gaya 5 din mein.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 61,
    name: "Hamza Butt",
    city: "Islamabad",
    rating: 5,
    text: "2nd purchase. Still happy.",
    date: "7 months ago",
    verified: true,
  },
  {
    id: 62,
    name: "Zeeshan Ahmed",
    city: "Gujranwala",
    rating: 4,
    text: "watch theek hai. honestly price thoda high laga tha order karte waqt. lekin aane ke baad theek laga — quality mein jo finish hai wo sasta nahi lagta. delivery thodi slow thi. overall theek raha.",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 63,
    name: "Salman Haider",
    city: "Lahore",
    rating: 5,
    text: "black leather apne liye liya. movement jo back se dikh raha hai wo unexpected feature tha. roz pehanta hoon aaj kal.",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 64,
    name: "Fawad Iqbal",
    city: "Karachi",
    rating: 5,
    text: "Forest green. Unique. Recommended.",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 65,
    name: "Noor Ahmad",
    city: "Multan",
    rating: 5,
    text: "deep blue single tone liya. slim hai comfortable hai. COD tha toh risk nahi tha. acha purchase raha.",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 66,
    name: "Taimur Khan",
    city: "Peshawar",
    rating: 5,
    text: "Good watch. Fast delivery. Will buy again.",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 67,
    name: "Wasif Ali",
    city: "Faisalabad",
    rating: 4,
    text: "acha hai bhai. expected se thoda better nikla. 4 star isliye ke delivery zyada time li.",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 68,
    name: "Mikail Hassan",
    city: "Islamabad",
    rating: 5,
    text: "TST deep blue aur PP single tone dono liye. dono hi alag feel dete hain. TST ka dial thoda aur bold hai. dono roz alternate karta hoon 😄",
    date: "8 months ago",
    verified: true,
  },
  {
    id: 69,
    name: "Ameer Hamza",
    city: "Lahore",
    rating: 5,
    text: "ice blue. sab se hatke color hai. khush hoon.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 70,
    name: "Zia Khan",
    city: "Rawalpindi",
    rating: 5,
    text: "bhai pehle 1 ghante socha ke order karun ya nahi. COD tha toh finally kar diya. aur watch acha aaya. ab woh 1 ghanta waste feel nahi hota 😂 recommend karta hoon.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 71,
    name: "Rauf Ahmad",
    city: "Karachi",
    rating: 4,
    text: "Price felt a bit high when ordering. But quality is honestly better than I expected. Not the best I've owned but for this range, fair deal.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 72,
    name: "Danyal Sheikh",
    city: "Sialkot",
    rating: 5,
    text: "dual tone gold wala liya. yaar real mein photography se zyada sundar dikhta hai. daily wear ban gaya.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 73,
    name: "Asad Mehmood",
    city: "Lahore",
    rating: 5,
    text: "Solid. Recommended.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 74,
    name: "Faris Khan",
    city: "Islamabad",
    rating: 5,
    text: "midnight black liya office ke liye. colleagues ne baar baar notice kiya. ek ne toh seriously poochha brand kya hai. khud khush ho gaya 😄",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 75,
    name: "Qasim Ali",
    city: "Multan",
    rating: 5,
    text: "Brown leather. Clean stitching. Daily use. No issues.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 76,
    name: "Hamad Tariq",
    city: "Karachi",
    rating: 5,
    text: "green single tone liya. ekdum alag color hai, dil khush ho gaya. delivery fast thi, koi issue nahi. next order ready hai.",
    date: "9 months ago",
    verified: true,
  },
  {
    id: 77,
    name: "Shahid Hassan",
    city: "Lahore",
    rating: 4,
    text: "watch acha hai. thoda time laga delivery mein. overall satisfied hoon.",
    date: "10 months ago",
    verified: true,
  },
  {
    id: 78,
    name: "Saqib Raza",
    city: "Faisalabad",
    rating: 5,
    text: "ice blue. simply gorgeous. wore to office first day, got asked twice.",
    date: "10 months ago",
    verified: true,
  },
  {
    id: 79,
    name: "Atif Malik",
    city: "Peshawar",
    rating: 5,
    text: "dual tone black liya. yaar ye colors blend jo hai na, real mein dekhne ka alag mazaa hai. photo mein nahi aata woh feel. satisfied hoon bilkul.",
    date: "10 months ago",
    verified: true,
  },
  {
    id: 80,
    name: "Furqan Ahmed",
    city: "Gujranwala",
    rating: 5,
    text: "Acha hai. Lelo.",
    date: "10 months ago",
    verified: true,
  },
  {
    id: 81,
    name: "Mubashir Khan",
    city: "Karachi",
    rating: 5,
    text: "pearl white single tone. office mein saaf aur professional lagta hai. COD tha toh bina soche order kar diya. acha raha.",
    date: "10 months ago",
    verified: true,
  },
  {
    id: 82,
    name: "Zarrar Ali",
    city: "Islamabad",
    rating: 5,
    text: "Fast delivery. Good quality. Happy.",
    date: "10 months ago",
    verified: true,
  },
  {
    id: 83,
    name: "Hassan Butt",
    city: "Lahore",
    rating: 5,
    text: "leather black apne abbu ko diya. wo bahut khush hue. khud ko bhi ek chahiye ab honestly.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 84,
    name: "Omer Khalid",
    city: "Rawalpindi",
    rating: 4,
    text: "thoda mehenga laga tha pehle. lekin jab haath mein aaya toh samjha ke kyon hai price itna. decent watch hai, delivery average thi. overall theek.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 85,
    name: "Raees Ahmad",
    city: "Multan",
    rating: 5,
    text: "TST deep blue order ki. pehle darr tha ke online watch reliable hogi ya nahi. but bilkul expected se acha nikla. ab dosto ko bhi recommend kar raha hoon.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 86,
    name: "Zohaib Malik",
    city: "Karachi",
    rating: 5,
    text: "Black single tone. Wrist mein fit. Done.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 87,
    name: "Khalid Hassan",
    city: "Sialkot",
    rating: 5,
    text: "champagne gold wali liya bhai ke liye. usne pehan ke bola yaar ye toh real mein aur sundar hai. khush ho gaya sun ke.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 88,
    name: "Ahmer Sheikh",
    city: "Lahore",
    rating: 5,
    text: "Ice blue. Minimal. Classy. No complaints.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 89,
    name: "Umer Farhan",
    city: "Islamabad",
    rating: 5,
    text: "deep blue single tone roz pehanta hoon. na heavy na cheap, sahi weight hai. COD service bohot acha feature hai, isi wajah se order kiya tha pehle.",
    date: "11 months ago",
    verified: true,
  },
  {
    id: 90,
    name: "Baqar Khan",
    city: "Faisalabad",
    rating: 4,
    text: "watch theek hai. delivery mein kuch din extra lage. but product sahi tha.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 91,
    name: "Affan Ali",
    city: "Karachi",
    rating: 5,
    text: "Ivory white. Elegant. Love it.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 92,
    name: "Hamdan Ahmad",
    city: "Peshawar",
    rating: 5,
    text: "green single tone — bhai Peshawar mein kisi ke paas ye color nahi dekhi. daily wear kar raha hoon. recommend karunga zaroor.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 93,
    name: "Sarmad Butt",
    city: "Lahore",
    rating: 5,
    text: "Mast. Seedha recommend.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 94,
    name: "Nadir Khan",
    city: "Multan",
    rating: 5,
    text: "black leather liya. roz pehanta hoon. paisa wasool hai bilkul.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 95,
    name: "Hassam Tariq",
    city: "Islamabad",
    rating: 5,
    text: "dual tone midnight black liya. yaar jab sun hit karta hai toh shine alag hi level ki hai. office mein kaafi notice hua. ab dono tones alternate karta hoon.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 96,
    name: "Talha Raza",
    city: "Karachi",
    rating: 5,
    text: "TST white liya. slim aur clean. daily use perfect hai.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 97,
    name: "Haseeb Malik",
    city: "Lahore",
    rating: 4,
    text: "acha watch hai. delivery thodi late thi. product se koi complaint nahi.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 98,
    name: "Mustafa Khan",
    city: "Rawalpindi",
    rating: 5,
    text: "bhai sach mein koi darr nahi tha kyunke COD tha. aur watch acha aaya. ab family mein se 2 aur order karne wale hain. trustworthy page hai.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 99,
    name: "Sufyan Ahmad",
    city: "Gujranwala",
    rating: 5,
    text: "Deep blue. Office approved.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 100,
    name: "Arslan Butt",
    city: "Karachi",
    rating: 5,
    text: "ice blue single tone. alag color, alag feel. roz pehanta hoon. koi masla nahi. seedha recommend.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 101,
    name: "Bilal Nawaz",
    city: "Lahore",
    rating: 5,
    text: "deep blue liya. sach kehna toh pehle price se hichkichaya tha. but COD ki wajah se try kar liya. aaya toh ekdum theek tha. price ka gila door ho gaya.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 102,
    name: "Zain Abbas",
    city: "Karachi",
    rating: 5,
    text: "Black single tone. Wore it to an interview. Got the job. Coincidence? Maybe.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 103,
    name: "Shahzaib Khan",
    city: "Islamabad",
    rating: 4,
    text: "leather strap brown wala liya. quality acha hai, thoda price zyada laga tha order karte waqt lekin haath mein aaya toh theek laga. delivery 5 din.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 104,
    name: "Moiz Ali",
    city: "Multan",
    rating: 5,
    text: "Champagne gold. Looks expensive. Isn't. Perfect.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 105,
    name: "Haris Mehmood",
    city: "Peshawar",
    rating: 5,
    text: "TST white single tone liya. slim hai, hath mein comfortable lagti hai. Peshawar mein bhi time pe aayi. khush hoon.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 106,
    name: "Jawad Hassan",
    city: "Faisalabad",
    rating: 5,
    text: "green wali le li bhai. office mein kisi ke paas nahi ye color. bas isliye liya tha alag dikhne ke liye 😄 kaam aaya.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 107,
    name: "Saifullah Khan",
    city: "Quetta",
    rating: 4,
    text: "acha watch hai. koi badi baat nahi bas theek hai. price thoda high socha tha but quality dekh ke chup ho gaya.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 108,
    name: "Ammar Raza",
    city: "Lahore",
    rating: 5,
    text: "midnight black dual tone liya. yaar jab dhoop mein aata hai toh shine alag hi lagti hai. roz office pehan ke jaata hoon. no regrets.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 109,
    name: "Subhan Ahmad",
    city: "Gujranwala",
    rating: 5,
    text: "Fast. Good. Done.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 110,
    name: "Talal Sheikh",
    city: "Rawalpindi",
    rating: 5,
    text: "ice blue single tone apne liye liya. ek hafte mein 4 logon ne poochha kahan se liya. recommend karta rehta hoon ab toh.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 111,
    name: "Hamid Farooq",
    city: "Sialkot",
    rating: 4,
    text: "Ordered pearl white. Delivery was 6 days. Watch is good quality for the price. Would buy again.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 112,
    name: "Osama Tariq",
    city: "Karachi",
    rating: 5,
    text: "bhai ne kaha online se watch mat le, fake hogi. COD dekha toh order kar diya. acha nikla. bhai ko bhi dikha diya 😂",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 113,
    name: "Faiz Ahmad",
    city: "Hyderabad",
    rating: 5,
    text: "TST deep blue. Dial shine is real. Pictures don't do it justice.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 114,
    name: "Rehman Butt",
    city: "Lahore",
    rating: 5,
    text: "brown leather apne liye liya. movement jo back se dikh raha hai woh mujhe personally bahut pasand hai. daily wear ban gaya.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 115,
    name: "Uzair Malik",
    city: "Islamabad",
    rating: 4,
    text: "watch theek hai yaar. thoda mehenga laga tha but quality ne justify kar diya. delivery average speed thi.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 116,
    name: "Shayan Ali",
    city: "Multan",
    rating: 5,
    text: "deep blue single tone. 2nd purchase hai mera. pehla experience acha tha isliye dobara aaya. consistent seller hai.",
    date: "1 year ago",
    verified: true,
  },
  {
    id: 117,
    name: "Faizan Khan",
    city: "Karachi",
    rating: 5,
    text: "ivory white dual tone. real mein photos se sundar hai. bas itna.",
    date: "1 year ago",
    verified: true,
  },
];

const SHOW_INITIAL = 6;
const LOAD_STEP = 6;

const PALETTE = [
  "#2563EB", "#059669", "#7C3AED", "#D97706",
  "#DC2626", "#0891B2", "#4F46E5", "#0D9488",
  "#C2410C", "#7E22CE",
];
function avatarColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return PALETTE[h % PALETTE.length];
}

function StarRating({ rating, small }: { rating: number; small?: boolean }) {
  const sz = small ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${sz} ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [visibleCount, setVisibleCount] = useState(SHOW_INITIAL);

  const total   = reviews.length;
  const avg     = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const dist    = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   Math.round((reviews.filter(r => r.rating === star).length / total) * 100),
  }));

  const visible  = reviews.slice(0, visibleCount);
  const hasMore  = visibleCount < total;
  const canLess  = visibleCount > SHOW_INITIAL;
  return (
    <section className="mt-12">
      <h2 className="section-title mb-5">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r sm:border-gray-200 flex-shrink-0">
          <span className="font-display text-5xl font-bold text-gray-900">{avg}</span>
          <StarRating rating={Math.round(parseFloat(avg))} />
          <span className="text-xs text-gray-400 mt-1.5">{total} reviews</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {dist.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2.5 text-xs text-gray-500">
              <span className="w-3 text-right flex-shrink-0">{star}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-right flex-shrink-0 text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {review.avatar ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: avatarColor(review.name) }}
                  >
                    {review.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                  <p className="text-xs text-gray-400">{review.city}</p>
                </div>
              </div>
              <div className="text-right">
                <StarRating rating={review.rating} small />
                <p className="text-xs text-gray-400 mt-0.5">{review.date}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
            {review.verified && (
              <p className="text-xs text-green-600 font-medium mt-2">✅ Verified Purchase</p>
            )}
          </div>
        ))}
      </div>

      {/* Load more / Show less */}
      <div className="mt-5 flex gap-3">
        {hasMore && (
          <button
            onClick={() => setVisibleCount(c => c + LOAD_STEP)}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            Load more
          </button>
        )}
        {canLess && (
          <button
            onClick={() => setVisibleCount(SHOW_INITIAL)}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            Show less
          </button>
        )}
      </div>
    </section>
  );
}
