import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

type Card = {
	id: string;
	name: string;
	arcana: 'major' | 'minor';
	suit?: string;
	rank?: string;
	meanings: { upright: string; reversed: string };
};

const majorArcana: Array<{ name: string; meanings: { upright: string; reversed: string } }> = [
	{ name: 'The Fool', meanings: { upright: '新的开始、信任与冒险', reversed: '冲动、鲁莽或畏缩不前' } },
	{ name: 'The Magician', meanings: { upright: '意志与资源的整合、行动力', reversed: '操控、能力未被有效利用' } },
	{ name: 'The High Priestess', meanings: { upright: '直觉、潜意识、静观', reversed: '信息被隐藏、直觉受阻' } },
	{ name: 'The Empress', meanings: { upright: '滋养、创造、丰盛', reversed: '过度依赖、耗损或创作阻塞' } },
	{ name: 'The Emperor', meanings: { upright: '结构、权威、稳定', reversed: '控制欲、僵化或权威滥用' } },
	{ name: 'The Hierophant', meanings: { upright: '传统、学习与指导', reversed: '打破常规、自主探索' } },
	{ name: 'The Lovers', meanings: { upright: '关系、选择与价值观一致', reversed: '冲突、选择困难或价值错位' } },
	{ name: 'The Chariot', meanings: { upright: '意志胜利、前进力', reversed: '失衡、失去控制' } },
	{ name: 'Strength', meanings: { upright: '勇气、耐心、内在力量', reversed: '自我怀疑或冲动' } },
	{ name: 'The Hermit', meanings: { upright: '内省、寻找答案、独处', reversed: '孤立、拒绝帮助' } },
	{ name: 'Wheel of Fortune', meanings: { upright: '周期变化、命运的转机', reversed: '阻滞、周期不利' } },
	{ name: 'Justice', meanings: { upright: '公平、责任与因果', reversed: '失衡、不公或回避责任' } },
	{ name: 'The Hanged Man', meanings: { upright: '暂停、不同视角、牺牲', reversed: '拖延或无法放下' } },
	{ name: 'Death', meanings: { upright: '结束与更新、必要的转变', reversed: '抗拒变革、停滞' } },
	{ name: 'Temperance', meanings: { upright: '平衡、调和、节制', reversed: '极端、不协调' } },
	{ name: 'The Devil', meanings: { upright: '束缚、诱惑、依赖', reversed: '解脱、认清并放下' } },
	{ name: 'The Tower', meanings: { upright: '突变、震撼性改变、真相显露', reversed: '延缓的崩解或内心抗拒' } },
	{ name: 'The Star', meanings: { upright: '希望、疗愈、灵感', reversed: '失望或信心不足' } },
	{ name: 'The Moon', meanings: { upright: '潜意识、幻象、情绪波动', reversed: '迷雾散去、错觉被看见' } },
	{ name: 'The Sun', meanings: { upright: '成功、光明、喜悦', reversed: '延迟的快乐或被压抑的乐观' } },
	{ name: 'Judgement', meanings: { upright: '觉醒、评估与重生', reversed: '自我审判或拒绝改变' } },
	{ name: 'The World', meanings: { upright: '完成、圆满、整合', reversed: '未完成的周期或新的起点被推迟' } },
];

const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const ranks = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];

const suitThemes: Record<string, { upright: string; reversed: string }> = {
	Wands: { upright: '能量、创造、行动', reversed: '能量分散、拖延' },
	Cups: { upright: '情感、关系、直觉', reversed: '情绪失衡、误解' },
	Swords: { upright: '思考、沟通、冲突', reversed: '混乱、误判或内耗' },
	Pentacles: { upright: '物质、工作、稳定', reversed: '财务或现实问题、停滞' },
};

const rankThemes: Record<string, { upright: string; reversed: string }> = {
	Ace: { upright: '新的开始或机会', reversed: '机会延迟或被错过' },
	Two: { upright: '二选一或合作的起点', reversed: '犹豫或不和' },
	Three: { upright: '团队、成长或收获的萌芽', reversed: '合作中断或延迟成果' },
	Four: { upright: '稳定、避难或反思', reversed: '停滞、无聊或守旧' },
	Five: { upright: '挑战、冲突与学习的机会', reversed: '冲突升级或无法解决' },
	Six: { upright: '恢复、协助或回归平衡', reversed: '回到旧问题或依赖' },
	Seven: { upright: '检视、试探与坚持', reversed: '怀疑、失去信念' },
	Eight: { upright: '加速、技巧或成长期', reversed: '阻碍、停滞不前' },
	Nine: { upright: '接近完成、独立或成就', reversed: '精力透支或不满足' },
	Ten: { upright: '完成、责任与周期终结', reversed: '过重负担或循环未完成' },
	Page: { upright: '消息、新人或学习开始', reversed: '幼稚或误导的信息' },
	Knight: { upright: '行动者、追求或冲劲', reversed: '冲动或不稳定的行动' },
	Queen: { upright: '关怀、成熟的表达', reversed: '情绪或能力被压抑' },
	King: { upright: '掌控、领导或资源管理', reversed: '控制问题或滥权' },
};

function buildDeck(): Card[] {
	const deck: Card[] = [];
	// major
	majorArcana.forEach((m, idx) => {
		deck.push({
			id: `MA${idx}`,
			name: m.name,
			arcana: 'major',
			meanings: { upright: m.meanings.upright, reversed: m.meanings.reversed },
		});
	});

	// minor
	for (const suit of suits) {
		for (const rank of ranks) {
			const id = `${rank}_${suit}`;
			const rankKey = rank === 'Ace' ? 'Ace' : rank;
			const rankMeaning = rankThemes[rankKey];
			const suitMeaning = suitThemes[suit];
			const upright = `${rankMeaning.upright}（${suitMeaning.upright}）`;
			const reversed = `${rankMeaning.reversed}（${suitMeaning.reversed}）`;
			deck.push({ id, name: `${rank} of ${suit}`, arcana: 'minor', suit, rank, meanings: { upright, reversed } });
		}
	}

	return deck;
}

function shuffle<T>(arr: T[]) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function interpretCard(card: Card, reversed: boolean) {
	const meaning = reversed ? card.meanings.reversed : card.meanings.upright;
	const orientation = reversed ? '逆位' : '正位';
	return `${card.name} (${orientation})：${meaning}`;
}

function svgDataUrl(cardName: string, reversed: boolean) {
	const orientation = reversed ? '逆位' : '正位';
	const bg = reversed ? '#fff7f0' : '#f7fff7';
	const accent = reversed ? '#c24141' : '#2b8a3e';
	const svg = `
	<svg xmlns='http://www.w3.org/2000/svg' width='420' height='600' viewBox='0 0 420 600'>
		<rect width='100%' height='100%' rx='18' fill='${bg}' stroke='#ddd' />
		<rect x='12' y='12' width='396' height='576' rx='14' fill='white' stroke='${accent}' stroke-width='4' />
		<g font-family='Segoe UI, Roboto, Arial' text-anchor='middle'>
			<text x='210' y='120' font-size='22' fill='${accent}' font-weight='700'>Tarot</text>
			<text x='210' y='180' font-size='20' fill='#333'>${escapeXml(cardName)}</text>
			<text x='210' y='220' font-size='14' fill='#666'>${orientation}</text>
			<rect x='60' y='260' width='300' height='260' rx='8' fill='${bg}' stroke='#eee' />
			<text x='210' y='420' font-size='12' fill='#999'>自动生成示意图</text>
		</g>
	</svg>`;

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(str: string) {
	return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export async function GET(request: Request) {
	const url = new URL(request.url);
	const category = (url.searchParams.get('category') || '').trim();
	const deck = buildDeck();
	const shuffled = shuffle(deck);
	const pick = shuffled.slice(0, 3);
	const positions = ['过去', '现在', '未来'];

	const cards = pick.map((c, i) => {
		const reversed = Math.random() < 0.5;
		// prefer static image in public/tarot if present
		let image: string | undefined;
		try {
			const publicPath = path.join(process.cwd(), 'public', 'tarot');
			const png = path.join(publicPath, `${c.id}.png`);
			const jpg = path.join(publicPath, `${c.id}.jpg`);
			if (fs.existsSync(png)) image = `/tarot/${encodeURIComponent(c.id)}.png`;
			else if (fs.existsSync(jpg)) image = `/tarot/${encodeURIComponent(c.id)}.jpg`;
		} catch (e) {
			// ignore, fall back to svg
		}
		if (!image) image = svgDataUrl(c.name, reversed);
		return {
			position: positions[i],
			name: c.name,
			arcana: c.arcana,
			suit: c.suit ?? null,
			rank: c.rank ?? null,
			reversed,
			meaning: reversed ? c.meanings.reversed : c.meanings.upright,
			brief: interpretCard(c, reversed),
			image,
		};
	});

	// Build a category-focused, more detailed summary (~200 characters) server-side
	function buildCategorySummary(cards: any[], category: string) {
		const baseSentences = cards.map((c) => `${c.position} — ${c.name}（${c.reversed ? '逆位' : '正位'}）：${c.meaning}`);
		const suggestion: string[] = [];
		// Category-specific guidance
		switch (category) {
			case '情感关系':
				suggestion.push(`${cards[1].name}提示当前情感层面需要真诚沟通与边界设定`);
				suggestion.push(`${cards[0].name}提醒你从过去的模式中学习`);
				suggestion.push(`${cards[2].name}提示未来有机会深化连接或需要灵活应对`);
				break;
			case '事业发展':
				suggestion.push(`${cards[1].name}显示现在是整合资源与建立影响力的时期`);
				suggestion.push(`${cards[0].name}提示回顾以往经验以规避重复错误`);
				suggestion.push(`${cards[2].name}提示未来可能会出现新的职责或挑战，建议提前准备`);
				break;
			case '财富管理':
				suggestion.push(`${cards[1].name}暗示需要稳健理财与长期规划`);
				suggestion.push(`${cards[0].name}提示检视以往花费与价值观`);
				suggestion.push(`${cards[2].name}提示未来要注意流动性或投资风险`);
				break;
			case '自我认知':
				suggestion.push(`${cards[1].name}表明这是自我整合与觉察的关键时刻`);
				suggestion.push(`${cards[0].name}提醒从过去的经验中找线索`);
				suggestion.push(`${cards[2].name}提示未来需要开放接纳新的自我理解`);
				break;
			case '目标达成':
				suggestion.push(`${cards[1].name}建议你聚焦步骤化行动并分解任务`);
				suggestion.push(`${cards[0].name}提醒你总结过去的教训以优化策略`);
				suggestion.push(`${cards[2].name}提示未来可能出现加速或阻碍，需灵活调整计划`);
				break;
			case '潜能开发':
				suggestion.push(`${cards[1].name}鼓励你去实验与扩展舒适圈`);
				suggestion.push(`${cards[0].name}提示回顾以往成功的能量模式`);
				suggestion.push(`${cards[2].name}提示未来可能出现契机，准备好发力`);
				break;
			default:
				suggestion.push(`${cards[1].name}显示当前为成长与整合的阶段，应继续巩固关键资源和关系`);
				suggestion.push(`${cards[0].name}提醒你回顾过去的经验以汲取教训`);
				suggestion.push(`${cards[2].name}提示未来需要灵活应对可能的变化`);
				break;
		}

		let summaryText = baseSentences.join(' ');
		if (suggestion.length) summaryText += ' 总体建议：' + suggestion.join('；') + '。';

		// Trim to ~200 chars politely
		if (summaryText.length > 220) {
			let trimmed = summaryText.slice(0, 220);
			const lastPunc = Math.max(trimmed.lastIndexOf('。'), trimmed.lastIndexOf('！'), trimmed.lastIndexOf('？'));
			if (lastPunc > Math.floor(220 * 0.4)) trimmed = trimmed.slice(0, lastPunc + 1);
			else trimmed = trimmed.trim() + '…';
			summaryText = trimmed;
		}
		return summaryText;
	}

	const summary = buildCategorySummary(cards, category);

	return NextResponse.json({
		success: true,
		timestamp: new Date().toISOString(),
		cards,
		summary,
		note: '位置顺序为过去/现在/未来；每张牌随机决定正位或逆位。',
	});
}

