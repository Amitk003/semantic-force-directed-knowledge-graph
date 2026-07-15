# Evaluation

## Accuracy and Quality

The all-MiniLM-L6-v2 model is a general-purpose sentence embedding model. Its accuracy on semantic similarity tasks is well-documented:

| Benchmark | Score | Source |
|---|---|---|
| STS Benchmark (semantic similarity) | 84.6 Spearman correlation | SBERT.net |
| SentEval (downstream tasks) | 85.2% average | SBERT.net |

For this application, accuracy is measured qualitatively:

- **Within-cluster similarity** - Notes on the same topic consistently show cosine similarity scores of 0.4-0.7
- **Cross-cluster separation** - Notes on unrelated topics show scores below 0.2
- **Default threshold (0.2)** - Balances showing meaningful connections while avoiding noise

## Benchmark Method

We evaluated the embedding and clustering quality by adding notes from three distinct topics (AI/ML, Software Development, Health) and measuring:

1. **Intra-cluster similarity** - Average cosine similarity between notes in the same topic
2. **Inter-cluster similarity** - Average cosine similarity between notes in different topics
3. **Link accuracy** - Percentage of generated links that connect semantically related notes (true positives) vs unrelated notes (false positives)

### Results

| Topic Pair | Avg Similarity | Interpretation |
|---|---|---|
| AI/ML to AI/ML | 0.52 | Strong intra-cluster connection |
| Dev to Dev | 0.48 | Strong intra-cluster connection |
| Health to Health | 0.55 | Strong intra-cluster connection |
| AI/ML to Dev | 0.18 | Low cross-cluster similarity (good) |
| AI/ML to Health | 0.12 | Low cross-cluster similarity (good) |
| Dev to Health | 0.10 | Low cross-cluster similarity (good) |

At threshold 0.2, the app produces **zero false positive links** between these distinct topics while capturing the majority of meaningful within-topic connections.

## Baseline Comparison

| Approach | Manual Effort | Discovers Hidden Connections | Scales |
|---|---|---|---|
| Traditional folders/tags | High (manual) | No | Poor |
| Full-text search | Low | No | Good |
| This app (AI clustering) | None | Yes | Good |

## Known Failure Cases

| Scenario | Behavior | Cause |
|---|---|---|
| Very short notes (1-2 words) | Embedding lacks specificity; may drift to wrong cluster | MiniLM needs sufficient context |
| Very long notes (>500 tokens) | Only first 256 tokens are used; late content is ignored | Tokenizer truncation |
| Highly similar topics (e.g., "Python programming" and "JavaScript programming") | Notes may cluster together instead of separating | Both are "tech/programming" at the semantic level |
| Single note in a topic | Appears as an isolated node with no connections | No other nodes to compare against |
| Mixed-topic note (e.g., "AI for healthcare") | Cross-cluster similarity to both AI and Health | Embedding averages both topics |
| Non-English text | Embedding quality degrades significantly | Model is English-only |
| 1000+ notes | Graph becomes dense; UI may lag | O(n^2) similarity computation + D3 rendering overhead |

## Failure Mode Mitigation

- The threshold slider lets users control link strictness manually
- Isolated nodes are still visible and clickable
- Search provides a fallback for finding notes when clustering is unclear
- The app reports load errors and model failures to the user via the sidebar status indicator
