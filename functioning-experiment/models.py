from dallinger.nodes import Source
import random

class ScientificChainSource(Source):
    """A Source that reads in a random story from a file and transmits it."""

    __mapper_args__ = {
        "polymorphic_identity": "science_in_media_source"
    }

    def _contents(self):
        """Define the contents of new Infos.

        transmit() -> _what() -> create_information() -> _contents().
        """
        stories = [
            "article1.html",
            "article2.html",
            "article3.html",
            "article4.html",
            "article5.html",
        ]
        story = random.choice(stories)
        with open("static/stimuli/{}".format(story), "r") as f:
            return f.read()
