// Fictional demo menus. Replace imageUrl and menu information here for real data.
export const filterDefinitions = {
  chocolate: [
    { key: "taste", label: "단맛", options: ["달콤함", "달지 않음"] },
    { key: "texture", label: "식감", options: ["부드러움", "꾸덕함"] },
    { key: "style", label: "스타일", options: ["클래식파", "개성파"] },
  ],
  cheesecake: [
    {
      key: "taste",
      label: "치즈 풍미",
      options: ["치즈맛 강함", "치즈맛 강하지 않음"],
    },
    { key: "texture", label: "식감", options: ["부드러움", "꾸덕함"] },
    { key: "style", label: "스타일", options: ["클래식파", "개성파"] },
  ],
};

export const cakes = [
  {
    id: "choco-01",
    category: "chocolate",
    name: "딥 다크 가나슈",
    shopName: "브라운 노트",
    price: 7800,
    imageUrl: "./images/cakes.png",
    imagePosition: 0,
    components: ["다크초콜릿", "진한 가나슈", "촉촉한 초코시트"],
    taste: "달지 않음",
    texture: "꾸덕함",
    style: "클래식파",
    description:
      "카카오의 깊은 풍미를 담은 다크초콜릿과 촘촘한 가나슈. 단맛을 절제해 초콜릿의 쌉싸름한 여운이 오래 남는 한 조각이에요.",
  },
  {
    id: "choco-02",
    category: "chocolate",
    name: "라즈베리 초코 레이어",
    shopName: "작은 베리",
    price: 8500,
    imageUrl: "./images/cakes.png",
    imagePosition: 1,
    components: ["진한 초코크림", "촉촉한 초코시트", "산딸기잼"],
    taste: "달콤함",
    texture: "부드러움",
    style: "개성파",
    description:
      "폭신한 초코시트 사이로 산딸기잼을 얇게 쌓았어요. 초코크림의 달콤함 끝에 베리의 산뜻한 새콤함이 느껴져요.",
  },
  {
    id: "choco-03",
    category: "chocolate",
    name: "크런치 쇼콜라",
    shopName: "오후의 조각",
    price: 7200,
    imageUrl: "./images/cakes.png",
    imagePosition: 2,
    components: ["다크초콜릿", "부드러운 가나슈", "바삭한 크런치"],
    taste: "달콤함",
    texture: "꾸덕함",
    style: "클래식파",
    description:
      "매끈한 가나슈와 바삭한 크런치가 만나는 초콜릿 케이크. 진한 초콜릿의 단맛과 씹는 즐거움을 함께 담았어요.",
  },
  {
    id: "choco-04",
    category: "chocolate",
    name: "밀크 초코 클라우드",
    shopName: "구름 제과",
    price: 6500,
    imageUrl: "./images/cakes.png",
    imagePosition: 3,
    components: ["밀크초콜릿", "가벼운 생크림", "폭신한 코코아시트"],
    taste: "달콤함",
    texture: "부드러움",
    style: "클래식파",
    description:
      "밀크초콜릿에 생크림을 더해 구름처럼 가볍게 만들었어요. 폭신한 코코아시트와 부드러운 크림이 포근하게 어우러져요.",
  },
  {
    id: "choco-05",
    category: "chocolate",
    name: "오렌지 다크 쇼콜라",
    shopName: "시트러스 룸",
    price: 8900,
    imageUrl: "./images/cakes.png",
    imagePosition: 4,
    components: ["다크초콜릿", "오렌지 제스트", "꾸덕한 초코크림"],
    taste: "달지 않음",
    texture: "꾸덕함",
    style: "개성파",
    description:
      "묵직한 다크초콜릿에 오렌지 껍질의 향을 더했어요. 진한 크림 속에서 시트러스 향이 은은하게 퍼지는 색다른 조합이에요.",
  },
  {
    id: "choco-06",
    category: "chocolate",
    name: "헤이즐넛 초코 무스",
    shopName: "넛츠 아틀리에",
    price: 8200,
    imageUrl: "./images/cakes.png",
    imagePosition: 5,
    components: ["헤이즐넛 페이스트", "초콜릿 무스", "고소한 견과 시트"],
    taste: "달지 않음",
    texture: "부드러움",
    style: "개성파",
    description:
      "달지 않은 초콜릿 무스에 볶은 헤이즐넛의 고소한 향을 담았어요. 가벼운 무스와 견과 시트가 부드럽게 이어져요.",
  },
  {
    id: "cheese-01",
    category: "cheesecake",
    name: "레몬 뉴욕 치즈",
    shopName: "리틀 치즈",
    price: 7500,
    imageUrl: "./images/cakes.png",
    imagePosition: 6,
    components: ["진한 크림치즈", "바삭한 쿠키 바닥", "상큼한 레몬"],
    taste: "치즈맛 강함",
    texture: "꾸덕함",
    style: "클래식파",
    description:
      "크림치즈의 진한 풍미를 그대로 담은 뉴욕 스타일. 바삭한 쿠키 바닥과 레몬의 산뜻한 끝맛이 풍성한 치즈 맛을 받쳐줘요.",
  },
  {
    id: "cheese-02",
    category: "cheesecake",
    name: "골든 바스크",
    shopName: "치즈의 온도",
    price: 8000,
    imageUrl: "./images/cakes.png",
    imagePosition: 7,
    components: ["고소한 치즈크림", "캐러멜 향", "부드러운 중심부"],
    taste: "치즈맛 강함",
    texture: "부드러움",
    style: "클래식파",
    description:
      "높은 온도로 구워 표면에는 캐러멜 향을, 중심에는 부드러운 치즈크림을 남겼어요. 짙은 치즈 풍미가 입안에서 천천히 녹아요.",
  },
  {
    id: "cheese-03",
    category: "cheesecake",
    name: "수플레 치즈 구름",
    shopName: "구름 제과",
    price: 6200,
    imageUrl: "./images/cakes.png",
    imagePosition: 8,
    components: ["가벼운 크림치즈", "우유", "폭신한 머랭"],
    taste: "치즈맛 강하지 않음",
    texture: "부드러움",
    style: "클래식파",
    description:
      "머랭을 섞어 공기처럼 가볍게 구운 수플레 치즈케이크. 우유의 고소함과 은은한 치즈 향으로 부담 없이 즐길 수 있어요.",
  },
  {
    id: "cheese-04",
    category: "cheesecake",
    name: "피스타치오 치즈 포레스트",
    shopName: "초록 한 조각",
    price: 9200,
    imageUrl: "./images/cakes.png",
    imagePosition: 9,
    components: ["진한 크림치즈", "피스타치오 크림", "견과 쿠키 바닥"],
    taste: "치즈맛 강함",
    texture: "꾸덕함",
    style: "개성파",
    description:
      "꾸덕한 크림치즈 위에 피스타치오 크림을 얹었어요. 견과의 고소한 향과 깊은 치즈 풍미가 차분하게 어우러지는 한 조각이에요.",
  },
  {
    id: "cheese-05",
    category: "cheesecake",
    name: "블루베리 치즈 블룸",
    shopName: "작은 베리",
    price: 8400,
    imageUrl: "./images/cakes.png",
    imagePosition: 10,
    components: ["순한 치즈크림", "블루베리 콩포트", "바삭한 크럼블"],
    taste: "치즈맛 강하지 않음",
    texture: "부드러움",
    style: "개성파",
    description:
      "순한 치즈크림과 블루베리 콩포트의 새콤달콤한 만남. 부드러운 크림에 크럼블을 더해 식감에도 작은 변화를 줬어요.",
  },
  {
    id: "cheese-06",
    category: "cheesecake",
    name: "솔티 캐러멜 치즈",
    shopName: "솔트 앤 버터",
    price: 7900,
    imageUrl: "./images/cakes.png",
    imagePosition: 11,
    components: ["순한 크림치즈", "솔티 캐러멜", "버터 쿠키 바닥"],
    taste: "치즈맛 강하지 않음",
    texture: "꾸덕함",
    style: "개성파",
    description:
      "부드러운 치즈 향에 소금 한 꼬집을 더한 캐러멜을 겹쳤어요. 꾸덕한 중심과 버터 쿠키 바닥이 고소하고 달콤하게 이어져요.",
  },
];

export function selectCakes(
  { category, filters, search = "", sort = "default" },
  source = cakes,
) {
  const query = search.trim().toLocaleLowerCase("ko");
  const result = source.filter(
    (cake) =>
      cake.category === category &&
      Object.entries(filters).every(
        ([key, value]) => !value || cake[key] === value,
      ) &&
      (!query ||
        [cake.name, cake.shopName, ...cake.components].some((value) =>
          value.toLocaleLowerCase("ko").includes(query),
        )),
  );
  if (sort === "asc") result.sort((a, b) => a.price - b.price);
  if (sort === "desc") result.sort((a, b) => b.price - a.price);
  return result;
}
