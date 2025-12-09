# 🎨 커스텀 카드 이미지 추가 가이드

현재 카드는 카테고리별 이모지(🍔, ☕, 🛍️ 등)를 사용하고 있습니다.  
실제 이미지 파일로 교체하려면 아래 방법을 따라주세요.

---

## 📂 방법 1: 로컬 이미지 파일 사용 (권장)

### 1. 이미지 폴더 생성

```
public/
└── images/
    └── cards/
        ├── food.png
        ├── cafe.png
        ├── groceries.png
        ├── fuel.png
        ├── transport.png
        ├── shopping.png
        ├── subscription.png
        ├── health.png
        ├── travel.png
        └── etc.png
```

### 2. 코드 수정

`src/utils/cards.ts` 파일에서:

```typescript
// 카드 일러스트: 로컬 이미지 파일 사용
const categoryImage: Record<string, string> = {
  FOOD: '/images/cards/food.png',
  CAFE: '/images/cards/cafe.png',
  GROCERIES: '/images/cards/groceries.png',
  FUEL: '/images/cards/fuel.png',
  TRANSPORT: '/images/cards/transport.png',
  SHOPPING: '/images/cards/shopping.png',
  SUBSCRIPTION: '/images/cards/subscription.png',
  HEALTH: '/images/cards/health.png',
  TRAVEL: '/images/cards/travel.png',
  ETC: '/images/cards/etc.png'
};

cards.push({
  // ... 기존 코드
  imageUrl: categoryImage[s.category] || '/images/cards/etc.png',
  // ...
});
```

### 3. CardView 컴포넌트 수정

`src/components/CardView.tsx`에서:

```tsx
{/* 카드 일러스트 */}
<div className="relative my-2 overflow-hidden rounded-lg border border-slate-600/50 bg-slate-800">
  <img
    src={card.imageUrl || '/images/cards/etc.png'}
    alt={card.name}
    className="h-24 w-full object-cover"
  />
</div>
```

---

## 🌐 방법 2: 외부 URL 이미지 사용

### Unsplash, Pixabay 등 무료 이미지

`src/utils/cards.ts`에서:

```typescript
const categoryImage: Record<string, string> = {
  FOOD: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
  CAFE: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200',
  // ... 등등
};
```

---

## 🤖 방법 3: AI 생성 이미지 (고급)

### DALL-E, Midjourney, Stable Diffusion 사용

1. **카테고리별 프롬프트 작성**
   ```
   FOOD: "credit card with food icons, digital art, game card style"
   CAFE: "credit card with coffee cup, fantasy game card illustration"
   ```

2. **이미지 생성 후 `public/images/cards/` 폴더에 저장**

3. **코드는 방법 1과 동일**

---

## 📐 권장 이미지 사양

- **크기**: 200px × 280px (카드 비율)
- **포맷**: PNG (투명 배경 가능) 또는 WebP
- **용량**: 각 50KB 이하 (로딩 속도)
- **스타일**: 일관된 아트 스타일 (판타지 카드 게임 느낌)

---

## 🎨 무료 이미지 리소스

### 1. 카드 게임 스타일 소스

- [Freepik](https://www.freepik.com/) - "game card", "fantasy card" 검색
- [Vecteezy](https://www.vecteezy.com/) - 벡터 카드 템플릿
- [OpenGameArt](https://opengameart.org/) - 게임용 무료 소스

### 2. 카테고리별 아이콘

- [Flaticon](https://www.flaticon.com/) - 식사, 카페, 쇼핑 등 아이콘
- [Icons8](https://icons8.com/) - 고품질 일러스트 아이콘

### 3. AI 이미지 생성 (무료/유료)

- [Leonardo.ai](https://leonardo.ai/) - 게임 카드 특화
- [Bing Image Creator](https://www.bing.com/images/create) - 무료
- [Midjourney](https://www.midjourney.com/) - 유료

---

## 🔧 개별 카드별 다른 이미지 사용

카테고리가 아닌 **각 카드마다** 다른 이미지를 사용하려면:

`src/data/cardAbilities.ts`에 이미지 URL 추가:

```typescript
{
  id: 'FOOD_1',
  category: 'FOOD',
  name: '든든한 한 끼',
  imageUrl: '/images/cards/food_01.png', // 추가
  // ... 기존 코드
}
```

`src/utils/cards.ts`에서 사용:

```typescript
cards.push({
  // ...
  imageUrl: abilityTemplate.imageUrl || categoryImage[s.category],
  // ...
});
```

---

## 💡 빠른 테스트용 Placeholder

개발 중에는 다음 서비스 활용:

```typescript
// 카테고리 색상별 placeholder
const categoryImage: Record<string, string> = {
  FOOD: 'https://placehold.co/200x280/f97316/white?text=FOOD',
  CAFE: 'https://placehold.co/200x280/f59e0b/white?text=CAFE',
  // ...
};
```

---

## 🎯 현재 상태 (이모지 사용 중)

지금은 이모지를 사용하므로:
- ✅ 추가 파일 불필요
- ✅ 즉시 작동
- ✅ 브라우저 호환성 100%

하지만 실제 게임 느낌을 원한다면 **방법 1 (로컬 이미지)**을 추천합니다!

---

**카드가 더욱 멋지게 변신할 거예요! 🎨✨**





