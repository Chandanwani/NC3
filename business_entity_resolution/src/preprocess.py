"""
Preprocessing and tokenization for names and addresses across US, India, and France.
"""

import re
import unicodedata

# Legal suffixes across US, India, and France
LEGAL_SUFFIXES = {
    'inc', 'incorporated', 'corp', 'corporation', 'llc', 'ltd', 'limited', 
    'pvt', 'private', 'co', 'company', 'services', 'enterprises', 'associates',
    'sarl', 'sasu', 'sa', 'sci', 'eurl', 'gmbh', 'bv', 'group', 'groupe',
    'trust', 'foundation', 'solutions', 'technologies', 'holdings', 'holding',
    'trading', 'aka', 'dba', 'center', 'centre', 'hospitality', 'international',
    'm/s', 'dr', 'mr', 'mrs', 'llp', 'pllc', 'pc', 'pa', 'and', 'the', 'of',
    'gérants', 'gerants', 'fils', 'frères', 'freres', 'cie', 'societe', 'ste'
}

# Common address stopwords across US, India, and France
ADDR_STOPWORDS = {
    'road', 'rd', 'street', 'st', 'avenue', 'ave', 'lane', 'ln', 'drive', 'dr',
    'boulevard', 'blvd', 'way', 'hwy', 'parkway', 'pkwy', 'circle', 'cir',
    'court', 'ct', 'floor', 'flr', 'fl', 'suite', 'ste', 'unit', 'apt', 'apartment',
    'bldg', 'building', 'block', 'blk', 'near', 'opp', 'behind', 'beside', 'phase',
    'sector', 'sec', 'plot', 'house', 'no', 'hno', 'shop', 'flat', 'nagar', 'colony',
    'chambers', 'tower', 'towers', 'plaza', 'complex', 'null', 'door', 'flats', 'and',
    'the', 'of', 'in', 'at', 'on', 'to', 'for', 'by', 'city', 'rue', 'de', 'du', 'des',
    'la', 'le', 'allée', 'allee', 'boulevard', 'bd', 'av', 'impasse', 'chemin', 'route'
}

def strip_accents(text: str) -> str:
    """Normalize unicode characters to ASCII where possible (e.g. é -> e)."""
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    return "".join([c for c in nfkd if not unicodedata.combining(c)])

def clean_name(text: str) -> tuple[str, list[str], set[str]]:
    """
    Clean business name, remove URLs/domains, strip legal suffixes.
    Returns: (cleaned_string, list_of_tokens, set_of_tokens)
    """
    if not text or text.lower() == 'null':
        return "", [], set()
        
    s = strip_accents(text.lower())
    # Extract domain words (e.g. celestialmemorialtrust.com -> celestial memorial trust)
    s = re.sub(r'https?://\S+|www\.\S+', ' ', s)
    s = re.sub(r'\.(com|org|net|in|co|us|fr|io|biz|info)\b', ' ', s)
    
    tokens = re.findall(r'[a-zA-Z0-9]+', s)
    words = [t for t in tokens if len(t) > 1 and t not in LEGAL_SUFFIXES]
    return s, words, set(words)

def clean_addr(text: str) -> tuple[str, list[str], set[str], set[str]]:
    """
    Clean address, standardize tokens, extract numeric components.
    Returns: (cleaned_string, list_of_tokens, set_of_tokens, set_of_numbers)
    """
    if not text or text.lower() == 'null':
        return "", [], set(), set()
        
    s = strip_accents(text.lower())
    tokens = re.findall(r'[a-zA-Z0-9]+', s)
    words = [t for t in tokens if len(t) > 2 and not t.isdigit() and t not in ADDR_STOPWORDS]
    nums = set(t for t in tokens if t.isdigit() and len(t) <= 6)
    return s, words, set(words), nums

def char_ngrams(s: str, n: int = 3) -> set[str]:
    """Generate character n-grams from alphanumeric text."""
    s_clean = re.sub(r'[^a-zA-Z0-9]', '', s.lower())
    if len(s_clean) < n:
        return {s_clean} if s_clean else set()
    return {s_clean[i:i+n] for i in range(len(s_clean) - n + 1)}

def dice_similarity(s1: str, s2: str, n: int = 3) -> float:
    """Calculate character n-gram Dice similarity."""
    g1 = char_ngrams(s1, n)
    g2 = char_ngrams(s2, n)
    if not g1 or not g2:
        return 0.0
    return 2.0 * len(g1.intersection(g2)) / (len(g1) + len(g2))

def jaccard(set1: set, set2: set) -> float:
    """Compute Jaccard similarity between two sets."""
    if not set1 or not set2:
        return 0.0
    u = len(set1.union(set2))
    return len(set1.intersection(set2)) / u if u > 0 else 0.0

def containment(set1: set, set2: set) -> float:
    """Compute maximum containment ratio between two sets."""
    if not set1 or not set2:
        return 0.0
    inter = len(set1.intersection(set2))
    return max(inter / len(set1), inter / len(set2))
