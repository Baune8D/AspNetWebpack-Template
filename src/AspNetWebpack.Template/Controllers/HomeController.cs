using System.Diagnostics;
using AspNetWebpack.Template.Models;
using Microsoft.AspNetCore.Mvc;

namespace AspNetWebpack.Template.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Inject()
        {
            return View();
        }

        public IActionResult Lazy()
        {
            return View();
        }

        public IActionResult Module()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
